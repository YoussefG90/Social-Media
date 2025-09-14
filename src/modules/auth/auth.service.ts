import type {Response , Request} from 'express';
import { IGmail, ILoginInputs, ISignupInputs } from './dto.auth';
import UserModel, { providerEnum } from '../../DB/models/user';
import { BadRequest, conflict, NotFound, Unauthorized } from '../../utils/Response/error.response';
import { compareHash, generateHash } from '../../utils/Security/Hash';
import { generateEncryption } from '../../utils/Security/Encryption';
import { CreateLoginCredentials} from '../../utils/Security/Token';
import { UserReposirotry } from '../../DB/repository/User.Repository';
import {OAuth2Client, type TokenPayload} from 'google-auth-library';
import { successResponse } from '../../utils/Response/success.response';
import { ILoginResponse } from './auth.entities';
import { emailEvent } from '../../utils/Events/email';



export const generateotp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



class AuthenticationService {
        private userModel = new UserReposirotry(UserModel)
    constructor() {}

    private async verifyGmailAccount(idToken:string):Promise<TokenPayload> {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_ID?.split(",") || [],
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequest("Fail To Verify Google Account")
        }
        return payload
    }


    loginWithGmail = async (req:Request , res:Response):Promise<Response> => {
      const  {idToken} : IGmail = req.body
      const {email} = await this.verifyGmailAccount(idToken)
      const user = await this.userModel.findOne({filter:{email , provider:providerEnum.Google}})
      if (!user) { 
        throw new NotFound("User Not Found Or Registered From Another Provider")
      }
      const Tokens = await CreateLoginCredentials(user)
      return successResponse<ILoginResponse>({res , data:{Tokens}})
    }


    signupWithGmail = async (req:Request , res:Response):Promise<Response> => {
      const  {idToken} : IGmail = req.body
      const {email , given_name , family_name} = await this.verifyGmailAccount(idToken)
      const user = await this.userModel.findOne({filter:{email}})
      if (user) {
         if (user.provider === providerEnum.Google) { 
            return await this.loginWithGmail(req ,res)
        }  
      throw new conflict("Email Exist")
      }
      const [newuser] = await this.userModel.create({data:[{
        firstName:given_name as string, lastName:family_name as string,
        email:email as string
    }]}) || []
    if (!newuser) {
        throw new BadRequest("Fail To SignUp With Gmail Please Try Again Later")
    }
      const Tokens = await CreateLoginCredentials(newuser)
      return successResponse<ILoginResponse>({res ,statusCode:201, data:{Tokens}})
    }

    signup = async (req:Request , res:Response) => {
        const otp = generateotp()
        const {firstName , lastName ,email, password , phone , gender , age} : ISignupInputs = req.body
        const checkuser = await this.userModel.findOne({filter :{email}})
        if (checkuser) {
           throw new conflict("Email Exist"  , 409)
        }
        const encryptePhone = await generateEncryption({plaintext : phone})
        await this.userModel.createUser({data:[{firstName , lastName , email , 
            password , phone:encryptePhone , age , gender,emailOTP:otp,
             emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000)}]})
         
        return successResponse({res ,statusCode:201, message:"Account Created Check Your Email To Verify"})           
    }

    login = async (req:Request , res:Response): Promise<Response> => {
        const {email , password}:ILoginInputs = req.body
        const user = await this.userModel.findOne({filter :{email , deletedAt:{$exists:false} ,
             provider:providerEnum.System , freezeAt:{$exists:false}}})
        if (!user) {
           throw new NotFound("User Not Found")
        }
        if (!user.confirmEmail) {
           throw new BadRequest("Email Not Confirmed")
        }
        const checkpassword = await compareHash({plaintext:password , value:user.password})
        if (!checkpassword) {
            throw new BadRequest("InVaild Login Data")
        }
        if (!user.twoFactorEnabled) {
          const Tokens = await CreateLoginCredentials(user)
          return successResponse<ILoginResponse>({res , data:{Tokens}})
        }
        const loginOtp = generateotp()
        const hashLoginOtp = await generateHash({plaintext:loginOtp})
        await this.userModel.updateOne({filter:{email}  , update:{
        $set:{twoFactorOTP:hashLoginOtp ,
        twoFactorExpires:new Date(Date.now()+ 3 * 60 * 1000)}
            }})
        emailEvent.emit("Two Factor Authentication", { to: email, otp: loginOtp });  
        return successResponse({res , message:"Login OTP Sent Successfully"})
    }

    loginWithTwoFactorAuthentication = async (req:Request , res:Response):Promise<Response> => {
      const {email , otp} = req.body
      const user = await this.userModel.findOne({filter:{email}})
          if (!user) {
            throw new NotFound("User Not Found")
          }
          if (user.twoFactorExpires.getTime() < Date.now()) {
          throw new Unauthorized("OTP Expired")}
          const unHashOtp = await compareHash({plaintext:otp , value:user.twoFactorOTP})
          if (!unHashOtp) {throw new BadRequest("InValid OTP")}
          await this.userModel.updateOne({filter:{email} ,
          update:{$unset:{twoFactorOTP:0 , twoFactorExpires:0}}})
          const Tokens = await CreateLoginCredentials(user)
          return successResponse({res , data:{Tokens}}) 
    }

    forgetPassword = async (req:Request , res:Response):Promise<Response> =>{
        const {email , newPassword}  = req.body
        const user = await this.userModel.findOne({filter :{email , deletedAt:{$exists:false} ,
             provider:providerEnum.System , confirmEmail:true }})
        if (!user) {
           throw new NotFound("User Not Found")
        }
        const checkConfirmOtp = await this.userModel.findOne({filter :{resetPassword:true}})
        if (!checkConfirmOtp) {
            throw new BadRequest("Please Confirm Rest OTP")
        }
        const hashPassword = await generateHash({plaintext : newPassword})
        await this.userModel.updateOne({filter:{email},update:{password:hashPassword}})
        return successResponse({res ,statusCode:201, message:"Password Rest Successfully"})
    }
    
}

export default new AuthenticationService()
import type {Response , Request} from 'express';
import { ILoginInputs, ISignupInputs } from './dto/dto.auth';
import UserModel from '../../DB/models/user';
import { BadRequest, conflict, NotFound } from '../../utils/Response/error.response';
import { compareHash, generateHash } from '../../utils/Security/Hash';
import { generateEncryption } from '../../utils/Security/Encryption';
import { emailEvent } from '../../utils/Events/email';
import { generateNewTokens } from '../../utils/Security/Token/Token';
import { UserReposirotry } from '../../DB/repository/User.Repository';



export const generateotp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



class AuthenticationService {
        private userModel = new UserReposirotry(UserModel)
    constructor() {}

    signup = async (req:Request , res:Response) => {
        const otp = generateotp()
        const {firstName , lastName ,email, password , phone , gender , age} : ISignupInputs = req.body
        const checkuser = await this.userModel.findOne({filter :{email}})
        if (checkuser) {
           throw new conflict("Email Exist"  , 409)
        }
        const hashPassword = await generateHash({plaintext : password})
        const encryptOTP = await generateHash({plaintext : otp})
        const encryptePhone = await generateEncryption({plaintext : phone})
        const user = await this.userModel.createUser({data:[{firstName , lastName , email , 
            password:hashPassword , phone:encryptePhone , age , gender,emailOTP:encryptOTP,
             emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000)}]})
        emailEvent.emit("Confirm Email", { to: email, otp });       
        res.status(201).json({message:"Account Created Check Your Email To Verify" , user})        
    }

    login = async (req:Request , res:Response) => {
        const {email , password}:ILoginInputs = req.body
        const user = await this.userModel.findOne({filter :{email , deletedAt:{$exists:false}}})
        if (!user) {
           throw new NotFound("User Not Found")
        }
        const checkOtp = await this.userModel.findOne({ filter :{confirmEmail:true}})
        if (!checkOtp) {
           throw new BadRequest("Email Not Confirmed")
        }
        const checkpassword = await compareHash({plaintext:password , value:user.password})
        if (!checkpassword) {
            throw new BadRequest("InVaild Login Data")
        }
        const Tokens = await generateNewTokens({user})
        return res.status(200).json({message:"Done" , Tokens})
    }

 
    
}

export default new AuthenticationService()
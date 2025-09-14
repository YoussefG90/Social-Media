import type {Response , Request} from 'express';
import UserModel from '../DB/models/user';
import { BadRequest, conflict, NotFound, Unauthorized } from '../utils/Response/error.response';
import { compareHash, generateHash } from '../utils/Security/Hash';
import { generateotp } from '../modules/auth/auth.service';
import { emailEvent } from '../utils/Events/email';
import { UserReposirotry } from '../DB/repository/User.Repository';
import { successResponse } from '../utils/Response/success.response';

export enum flag {email= "email" , forgetPassword = "forgetPassword" , newEmail = "newEmail"}
export enum twoFactorEnum {activate = "activate" , deactivate = "deactivate" , verify = "verify" ,
     deactivateVerify = "deactivateVerify"}

interface ITwoFactor {
    email:string,
    type:string,
    otp:string,
}


interface IOtpInputs {
    email:string,
    newEmail:string,
    type:string,
    otp:string,
    newEmailOtp:string

}


class OTPMiddleware {
     private userModel = new UserReposirotry(UserModel)
    constructor() {}

    get = async (req:Request , res:Response ) => {
    const {email ,newEmail ,  type}:IOtpInputs = req.body
    const user = await this.userModel.findOne({filter:{email}})
    if (!user) {
        throw new NotFound("User Not Found")
    }
    switch (type) {
        case flag.email:
            const newOtp = generateotp()
            const hashEmailOtp = await generateHash({plaintext:newOtp})
            await this.userModel.updateOne({filter:{email} ,
                update:{$set:{confirmEmail:false ,emailOTP:hashEmailOtp , emailOTPExpires:new Date(Date.now()+ 3 * 60 * 1000)},
                $exists:{emailOTP:false}}})
            emailEvent.emit("Confirm Email", { to: email, otp:newOtp });  
            successResponse({res , message:"New Verify OTP Sent Successfully"})
            break;
        case flag.forgetPassword:
            const newRestOtp = generateotp()
            const hashRestOtp = await generateHash({plaintext:newRestOtp})
            await this.userModel.updateOne({filter:{email} ,
                update:{$set:{resetPassword:false ,resetPasswordOTP:hashRestOtp , resetPasswordOTPExpires:new Date(Date.now()+ 3 * 60 * 1000)},
                $exists:{resetPassword:false}}})
            emailEvent.emit("Reset Password", { to: email, otp:newRestOtp }); 
            successResponse({res , message:"New Reset OTP Sent Successfully"})   
                 break;
        case flag.newEmail:
            if (newEmail === email) {
                throw new conflict("Sorry Cannot Update With Same Email")
            }
            const existingUser = await this.userModel.findOne({ filter:{email: newEmail} });
            if (existingUser) {
            throw new BadRequest("Email already in use");
            }
            const oldEmailOtp = generateotp()
            const newEmailOtp = generateotp()
            const hashOldEmailOtp = await generateHash({plaintext:oldEmailOtp})
            const hashNewEmailOtp = await generateHash({plaintext:newEmailOtp})
            await this.userModel.updateOne({filter:{email} ,
                update:{$set:{confirmEmail:false ,emailOTP:hashOldEmailOtp ,tempEmail:newEmail,
                    newEmailOTP:hashNewEmailOtp,newEmailOTPExpires:new Date(Date.now()+ 3 * 60 * 1000) ,emailOTPExpires:new Date(Date.now()+ 3 * 60 * 1000)},
                $exists:{emailOTP:false , newEmailOTP:false}}})
            emailEvent.emit("Confirm Email", { to: email, otp:oldEmailOtp }); 
            emailEvent.emit("Confirm Email", { to: newEmail, otp:newEmailOtp }); 
            successResponse({res , message:"Confirm OTP Sent Successfully To Old & New Email"}) 
        default:
            break;
    }
}


verify = async (req:Request , res:Response):Promise<void> => {
    const {email , type , otp , newEmailOtp}:IOtpInputs = req.body
    const user = await this.userModel.findOne({filter:{email}})
    if (!user) {
        throw new NotFound("User Not Found")
    }

    switch (type) {
        case flag.email:
            if (user.emailOTPExpires.getTime() < Date.now()) {
                throw new Unauthorized("OTP Expired")}
            const unHashOtp = await compareHash({plaintext:otp , value:user.emailOTP})
            if (!unHashOtp) {throw new BadRequest("InValid OTP")}
             await this.userModel.updateOne({filter:{email} ,
                update:{$unset:{emailOTP:0 , emailOTPExpires:0},$set:{confirmEmail:true}}})
            successResponse({res , message:"Email Verfied Successfully"})     
            break; 
        case flag.forgetPassword:
            if (user.resetPasswordOTPExpires.getTime() < Date.now()) {
                throw new Unauthorized("OTP Expired")}
            const unHashResetOtp = await compareHash({plaintext:otp , value:user.resetPasswordOTP})
            if (!unHashResetOtp) {throw new BadRequest("InValid OTP")}
             await this.userModel.updateOne({filter:{email} ,
                update:{$unset:{resetPasswordOTP:0 , resetPasswordOTPExpires:0},$set:{resetPassword:true}}})
            successResponse({res , message:"Reset OTP Verfied Successfully"})
                
            break; 
        case flag.newEmail:
            if (user.newEmailOTPExpires.getTime() < Date.now()) {
                throw new Unauthorized("OTP Expired")}
            const unHashOldEmailOtp = await compareHash({plaintext:otp , value:user.emailOTP})
            const unHashNewEmailOtp = await compareHash({plaintext:newEmailOtp , value:user.newEmailOTP})
            console.log(unHashOldEmailOtp , unHashNewEmailOtp);
            if (!unHashOldEmailOtp || !unHashNewEmailOtp) {
                throw new BadRequest("InValid OTP")
            }
             await this.userModel.updateOne({filter:{email} ,
                update:{$unset:{emailOTP:0 , emailOTPExpires:0 , newEmailOTP:0 , newEmailOTPExpires:0}
                ,$set:{resetEmail:true , confirmEmail:true}}})
            successResponse({res , message:"Change Email OTP Verfied Successfully"})
                
        default:
            break;
     }
    }

    twoFactor = async (req:Request , res:Response):Promise<void> => {
        const {email ,  type , otp}:ITwoFactor = req.body
        const user = await this.userModel.findOne({filter:{email}})
         if (!user) {
        throw new NotFound("User Not Found")
        }
        switch (type) {
                case twoFactorEnum.activate:
                const activateOtp = generateotp()
                const hashActivateOtp = await generateHash({plaintext:activateOtp})
                await this.userModel.updateOne({filter:{email}  , update:{
                    $set:{twoFactorOTP:hashActivateOtp ,
                        twoFactorExpires:new Date(Date.now()+ 3 * 60 * 1000)}
                }})
                emailEvent.emit("Two Factor Authentication", { to: email, otp: activateOtp });  
                successResponse({res , message:"Activate OTP Sent Successfully"})
                 break;
            case twoFactorEnum.deactivate:
                const deactivateOtp = generateotp()
                const hashDeactivateOtp = await generateHash({plaintext:deactivateOtp})
                await this.userModel.updateOne({filter:{email}  , update:{
                    $set:{twoFactorOTP:hashDeactivateOtp ,
                        twoFactorExpires:new Date(Date.now()+ 3 * 60 * 1000)}
                }})
                emailEvent.emit("Two Factor Authentication", { to: email, otp: deactivateOtp });  
                successResponse({res , message:"Deactivate OTP Sent Successfully"})
                break;
            case twoFactorEnum.verify:
                 if (user.twoFactorExpires.getTime() < Date.now()) {
                        throw new Unauthorized("OTP Expired")
                    }
                const unHashOtp = await compareHash({plaintext:otp , value:user.twoFactorOTP})
                if (!unHashOtp) {throw new BadRequest("InValid OTP")}
                await this.userModel.updateOne({filter:{_id:req.user?._id}  , update:{
                    $set:{twoFactorEnabled:true},
                    $unset:{twoFactorOTP:0 , twoFactorExpires:0}
                }})  
                successResponse({res , message:"Activate 2FA Successfully"})
                break;
            case twoFactorEnum.deactivateVerify:
                 if (user.twoFactorExpires.getTime() < Date.now()) {
                        throw new Unauthorized("OTP Expired")
                    }
                const unDeactivateHashOtp = await compareHash({plaintext:otp , value:user.twoFactorOTP})
                if (!unDeactivateHashOtp) {throw new BadRequest("InValid OTP")}
                await this.userModel.updateOne({filter:{_id:req.user?._id}  , update:{
                    $set:{twoFactorEnabled:false},
                    $unset:{twoFactorOTP:0 , twoFactorExpires:0}
                }})  
                successResponse({res , message:"Deactivate 2FA Successfully"})
                break;
        
           default:
        
            break;
        }

    }



}





export default new OTPMiddleware()
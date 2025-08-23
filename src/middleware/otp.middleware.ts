import type {Response , Request} from 'express';
import * as DBservices from '../DB/DBservices'
import UserModel from '../DB/models/user';
import { BadRequest, NotFound, Unauthorized } from '../utils/Response/error.response';
import { compareHash, generateHash } from '../utils/Security/Hash';
import { generateotp } from '../modules/auth/auth.service';
import { emailEvent } from '../utils/Events/email';

export enum flag {email= "email" , forgetPassword = "forgetPassword" , newEmail = "newEmail"}

interface IOtpInputs {
    email:string,
    type:string,
    otp:string
}

export const get = async (req:Request , res:Response ) => {
    const {email , type}:IOtpInputs = req.body
    const user = await DBservices.findOne({model: UserModel , filter:{email}})
    if (!user) {
        throw new NotFound("User Not Found")
    }
    switch (type) {
        case flag.email:
            const newOtp = generateotp()
            const hashEmailOtp = await generateHash({plaintext:newOtp})
            await DBservices.findOneAndUpdate({model:UserModel , filter:{email} ,
                update:{$set:{confirmEmail:false ,emailOTP:hashEmailOtp , emailOTPExpires:new Date(Date.now()+ 3 * 60 * 1000)},
                $exists:{emailOTP:false}}})
            emailEvent.emit("Confirm Email", { to: email, otp:newOtp });  
            res.status(200).json({message:"New Verify OTP Sent Successfully"}) 
            break;
        case flag.forgetPassword:
            const newRestOtp = generateotp()
            const hashRestOtp = await generateHash({plaintext:newRestOtp})
            await DBservices.findOneAndUpdate({model:UserModel , filter:{email} ,
                update:{$set:{resetPassword:false ,resetPasswordOTP:hashRestOtp , resetPasswordOTPExpires:new Date(Date.now()+ 3 * 60 * 1000)},
                $exists:{resetPassword:false}}})
            emailEvent.emit("Reset Password", { to: email, otp:newRestOtp }); 
            res.status(200).json({message:"New Reset OTP Sent Successfully"})    
    
        default:
            break;
    }
}


export const verify = async (req:Request , res:Response):Promise<void> => {
    const {email , type , otp }:IOtpInputs = req.body
    const user = await DBservices.findOne({model: UserModel , filter:{email}})
    if (!user) {
        throw new NotFound("User Not Found")
    }

    switch (type) {
        case flag.email:
            if (user.emailOTPExpires.getTime() < Date.now()) {
                throw new Unauthorized("OTP Expired")}
            const unHashOtp = await compareHash({plaintext:otp , value:user.emailOTP})
            if (!unHashOtp) {throw new BadRequest("InValid OTP")}
             await DBservices.findOneAndUpdate({model:UserModel , filter:{email} ,
                update:{$unset:{emailOTP:0 , emailOTPExpires:0},$set:{confirmEmail:true}}})
            res.status(200).json({message:"Email Verfied Successfully"})  
            break; 
        case flag.forgetPassword:
            if (user.resetPasswordOTPExpires.getTime() < Date.now()) {
                throw new Unauthorized("OTP Expired")}
            const unHashResetOtp = await compareHash({plaintext:otp , value:user.resetPasswordOTP})
            if (!unHashResetOtp) {throw new BadRequest("InValid OTP")}
             await DBservices.findOneAndUpdate({model:UserModel , filter:{email} ,
                update:{$unset:{resetPasswordOTP:0 , resetPasswordOTPExpires:0},$set:{resetPassword:true}}})
            res.status(200).json({message:"Reset OTP Verfied Successfully"})
        default:
            break;
    }
}
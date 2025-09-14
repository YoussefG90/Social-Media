import {z} from 'zod'
import { genralFields } from '../../middleware/validation.middleware'


export const login = {
    body:z.strictObject({
        email:genralFields.email,
        password:genralFields.password
})}



export const Signup = {
    body:login.body.extend({
        firstName:genralFields.name,
        lastName:genralFields.name ,
        confirmPassword:z.string(),
        phone:genralFields.phone ,
        gender:genralFields.gender,
        age:genralFields.age
    }).refine((data) => data.confirmPassword === data.password, {
    message: "confirmPassword notMatch Password", path: ["confirmPassword"]})
}

export  const getOtp = {
    body:z.strictObject({
        email:genralFields.email,
        newEmail:genralFields.email.optional(),
        type:z.string(),
    })
}

export  const verfiyOtp = {
    body:getOtp.body.extend({
        otp:genralFields.otp,
        newEmailOtp:genralFields.otp.optional()
    })
}



export  const signupWithGmail = {
    body:z.strictObject({
        idToken:z.string()
    })
}

export  const forgetPassword = {
    body:z.strictObject({
        email:genralFields.email,
        newPassword:genralFields.password,
        confirmNewPassword:z.string()
    }).refine((data) => data.confirmNewPassword === data.newPassword, {
    message: "confirmNewPassword notMatch newPassword", path: ["confirmNewPassword"]})
}


export  const twoFactorAuthenticationLogin = {
    body:z.strictObject({
        email:genralFields.email,
        otp:genralFields.otp,
    })
}

export  const twoFactorAuthentication = {
    body:twoFactorAuthenticationLogin.body.extend({
        type:z.string(),
    })
}
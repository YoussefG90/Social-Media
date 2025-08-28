import {z} from 'zod'
import * as Validate from '../../middleware/validation.middleware'

export const login = {
    body:z.strictObject({
        email:Validate.genralFields.email,
        password:Validate.genralFields.password
})}



export const Signup = {
    body:login.body.extend({
        firstName:Validate.genralFields.name,
        lastName:Validate.genralFields.name ,
        confirmPassword:z.string(),
        phone:Validate.genralFields.phone ,
        gender:Validate.genralFields.gender,
        age:Validate.genralFields.age
    }).refine((data) => data.confirmPassword === data.password, {
    message: "confirmPassword notMatch Password", path: ["confirmPassword"]})
}

export  const getOtp = {
    body:z.strictObject({
        email:Validate.genralFields.email,
        type:z.string(),
    })
}

export  const verfiyOtp = {
    body:getOtp.body.extend({
        otp:Validate.genralFields.otp
    })
}



export  const signupWithGmail = {
    body:z.strictObject({
        idToken:z.string()
    })
}

export  const forgetPassword = {
    body:z.strictObject({
        email:Validate.genralFields.email,
        newPassword:Validate.genralFields.password,
        confirmNewPassword:z.string()
    }).refine((data) => data.confirmNewPassword === data.newPassword, {
    message: "confirmNewPassword notMatch newPassword", path: ["confirmNewPassword"]})
}
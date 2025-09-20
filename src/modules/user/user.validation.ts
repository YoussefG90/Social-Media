import {z} from 'zod';
import { logoutEnum } from '../../utils/Security/Token';
import { genralFields } from '../../middleware/validation.middleware';
import { fileValidation } from '../../utils/Multer/cloud';
import { Types } from 'mongoose';
import { roleEnum } from '../../DB/models';



export const changeRole = {
    params:z.strictObject({
        userId:genralFields.id
    }),
    body:z.strictObject({
        role:z.enum(roleEnum)
    })
}

export const sendFriendRequest = {
    params:z.strictObject({
        userId:genralFields.id
    })
}

export const acceptFriendRequest = {
    params:z.strictObject({
        requestId:genralFields.id
    })
}


export const logout = {
    body:z.strictObject({
        flag:z.enum(logoutEnum).default(logoutEnum.signout)
    })
}

export const updateBasicInfo = {
    body:z.strictObject({
        firstName:genralFields.name.optional(),
        lastName:genralFields.name.optional(),
        age:genralFields.age.optional(),
        phone:genralFields.phone.optional(),
        gender:genralFields.gender.optional()
    })
}


export const updatePassword = {
  body: z
    .strictObject({
      oldPassword: genralFields.password,
      newPassword: genralFields.password,
      confirmNewPassword: z.string(),
    })
    .refine(
      (data) => data.confirmNewPassword === data.newPassword,
      {
        message: "confirmNewPassword notMatch newPassword",
        path: ["confirmNewPassword"],
      }
    ),
};


export const profileImage = {
    file:z.strictObject({
        fieldname:genralFields.file.fieldname.includes("Image"),
        originalname:genralFields.file.originalname,
        encoding:genralFields.file.encoding,
        mimetype:z.enum(fileValidation.Image as [string, ...string[]]),
        destination:genralFields.file.destination,
        filename:genralFields.file.filename,
        path:genralFields.file.path,
        size:genralFields.file.size
    })
}

export const coverImage = {
    file:profileImage.file.extend({
        fieldname:genralFields.file.fieldname.includes("Cover")
    })
}


export const freezeAccount = {
    params:z.object({
        userId:z.string().optional()
    }).optional().refine(
        (data) => {
            return data?.userId ? Types.ObjectId.isValid(data.userId) : true
        },
        {error:"In-Valid ObjectId Format" , path:["userId"]}
    )
}

export const restoreAccount = {
    params:z.object({
        userId:z.string()
    }).refine(
        (data) => {
            return Types.ObjectId.isValid(data.userId)
        },
        {error:"In-Valid ObjectId Format" , path:["userId"]}
    )
}


export const hardDelete = restoreAccount
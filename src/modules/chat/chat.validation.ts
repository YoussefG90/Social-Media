import {z} from "zod"
import { genralFields } from "../../middleware/validation.middleware"
import { fileValidation } from "../../utils/Multer/cloud"

export const getChat = {
    params:z.strictObject({
        userId:genralFields.id
    }),
    query:z.strictObject({
        page:z.coerce.number().int().min(1).optional(),
        size:z.coerce.number().int().min(1).optional()
    })
}


export const getGroup = {
    params:z.strictObject({
        groupId:genralFields.id
    }),
    query:getChat.query
}


export const createGroup = {
    body:z.strictObject({
        participants:z.array(genralFields.id).min(1),
        group:z.string().min(2).max(5000),
    }).superRefine((data,ctx)=>{
         if (data.participants?.length && data.participants.length !== [new Set (data.participants)].length) {
         ctx.addIssue({code:"custom" , path:["Tages"],message:"Duplicated Tagged User"})
        }
    }),
    file:z.strictObject({
            fieldname:genralFields.file.fieldname.includes("Image"),
            originalname:genralFields.file.originalname,
            encoding:genralFields.file.encoding,
            mimetype:z.enum(fileValidation.Image as [string, ...string[]]),
            destination:genralFields.file.destination,
            filename:genralFields.file.filename,
            path:genralFields.file.path,
            size:genralFields.file.size
        }).optional()
}
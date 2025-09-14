import {z} from 'zod'
import { AllowCommentsEnum, AvailabilityEnum, LikeActionEnum } from '../../DB/models/post'
import { genralFields } from '../../middleware/validation.middleware'
import { fileValidation } from '../../utils/Multer/cloud'



export const createPost = {
    body:z.strictObject({
          content:z.string().min(2).max(500000).optional(),
          attachments:z.array(genralFields.files(fileValidation.Image)).max(2).optional(),
          availability:z.enum(AvailabilityEnum).default(AvailabilityEnum.public),
          allowComments:z.enum(AllowCommentsEnum).default(AllowCommentsEnum.Allow),
          tags:z.array(genralFields.id).max(10).optional()
    }).superRefine((data,ctx) =>{
        if(!data.attachments?.length && !data.content){
            ctx.addIssue({code:"custom" , path:["Content"] ,
                 message:"Sorry Cannot Make Post Without Content Or Attachment"})
        }
        if (data.tags?.length && data.tags.length !== [new Set (data.tags)].length) {
            ctx.addIssue({code:"custom" , path:["Tages"],message:"Duplicated Tagged User"})
        }
    })
}


export const likePost = {
    params:z.strictObject({
        postId:genralFields.id
    }),
    query:z.strictObject({
        action:z.enum(LikeActionEnum).default(LikeActionEnum.like)
    })
}
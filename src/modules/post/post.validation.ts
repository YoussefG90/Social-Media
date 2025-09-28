import {z} from 'zod'
import { AllowCommentsEnum, AvailabilityEnum, LikeActionEnum } from '../../DB/models/post'
import { genralFields } from '../../middleware/validation.middleware'
import { fileValidation } from '../../utils/Multer/cloud'



export const createPost = {
    body:z.strictObject({
          content:z.string().min(2).max(500000).optional(),
          attachments:z.array(genralFields.files(fileValidation.Image)).max(2).optional(),
          availability:z.enum(AvailabilityEnum).default(AvailabilityEnum.public),
          allowPosts:z.enum(AllowCommentsEnum).default(AllowCommentsEnum.Allow),
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

export const updatePost = {
    params:z.strictObject({
        PostId:genralFields.id
    }),
    body:z.strictObject({
          content:z.string().min(2).max(500000).optional(),
          attachments:z.array(genralFields.files(fileValidation.Image)).max(2).optional(),
          removedAttachments:z.array(z.string()).max(2).optional(),
          availability:z.enum(AvailabilityEnum).optional(),
          allowPosts:z.enum(AllowCommentsEnum).optional(),
          tags:z.array(genralFields.id).max(10).optional(),
          removedTags:z.array(genralFields.id).max(10).optional()
    }).superRefine((data,ctx) =>{
        if(!Object.values(data)?.length){
            ctx.addIssue({code:"custom" , path:["Inputs"] ,
                 message:"All Keys Are Empty"})
        }
        if (data.tags?.length && data.tags.length !== [new Set (data.tags)].length) {
            ctx.addIssue({code:"custom" , path:["Tages"],message:"Duplicated Tagged User"})
        }
        if (data.removedTags?.length && data.removedTags.length !== [new Set (data.removedTags)].length) {
            ctx.addIssue({code:"custom" , path:["removedTags"],message:"Duplicated removedTags User"})
        }
    })
}


export const likePost = {
    params:z.strictObject({
        PostId:genralFields.id
    }),
    query:z.strictObject({
        action:z.enum(LikeActionEnum).default(LikeActionEnum.like)
    })
}

export const freezePost = {
    params:updatePost.params
}
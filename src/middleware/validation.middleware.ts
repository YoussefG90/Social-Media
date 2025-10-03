import {z} from 'zod'
import type {ZodError , ZodType} from 'zod'
import type {Response , Request , NextFunction} from 'express';     
import { genderEnum } from '../DB/models/user';
import { BadRequest } from '../utils/Response/error.response';
import { Types } from 'mongoose';
import { GraphQLError } from 'graphql';


type keyReqType = keyof Request
type SchemaType = Partial<Record<keyReqType ,ZodType>>
type validationErrorType = Array<{key:keyReqType ;
     issues:Array<{message: string ; path :(string | symbol | number | undefined)[];
     }>
    }>

export const genralFields = {
    name:z.string().min(2).max(20).regex(new RegExp(/[A-Z][a-zA-Z][^#&<>\"~;$^%{}?]{1,20}$/)),
    email: z.email(),
    password:z.string().regex(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
    phone:z.string().regex(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    gender:z.enum([...Object.values(genderEnum)]),
    age:z.number().lt(100).gte(16),
    otp:z.string().regex(/^\d{6}$/),
    // id:z.string().custom((value,helper)=>{
    //     return Types.ObjectId.isValid(value) || helper.message("In-Valid ObjectId")
    // }),
    file:{
        fieldname:z.string(),
        originalname:z.string(),
        encoding:z.string(),
        mimetype:z.string(),
        destination:z.string(),
        filename:z.string(),
        path:z.string(),
        size:z.number().positive()
    },
    files: function(mimetype:string[]) {
        return z.strictObject({
            fieldname:z.string(),
            originalname:z.string(),
            encoding:z.string(),
            mimetype:z.enum(mimetype),
            destination:z.string().optional(),
            filename:z.string().optional(),
            path:z.string().optional(),
            size:z.number().positive()
        })
        
    },
    id:z.string().refine((data)=>{return Types.ObjectId.isValid(data)},
            {error:"invalid objectId Format"})
} 


export const Validation = (schema:SchemaType) => {
    return (req:Request , res:Response , next:NextFunction) : NextFunction =>{
        const validationError:validationErrorType = []
        for (const key of Object.keys(schema) as keyReqType[]) {
            if (!schema[key]) continue 
            if (req.file) {
                req.body.attachment = req.file
            }
              if (req.files) {
                req.body.attachments = req.files
            }
            
            const validationResult = schema[key].safeParse(req[key])
            if (!validationResult.success) {
                const errors = validationResult.error as ZodError
                validationError.push({key ,
                     issues:errors.issues.map((issue) => {
                        return{message:issue.message ,path:issue.path}
                     })})
            }
            if (validationError.length) {
                throw new BadRequest("Validation Error" , {validationError})
            }

        } 
        return next() as unknown as NextFunction 
    }
}



export const graphValidation = async <T=any>(schema:ZodType , args:T) => {
            const validationResult = await schema.safeParseAsync(args)
            if (!validationResult.success) {
                const errors = validationResult.error as ZodError
               throw new GraphQLError("Validation Error", {
                    extensions: {
                        statusCode: 400,
                        issues: [
                            {
                                key: "args",
                                issues: errors.issues.map((issue) => ({
                                    message: issue.message,
                                    path: issue.path
                                }))
                            }
                        ]
                    }
                })
            }
}
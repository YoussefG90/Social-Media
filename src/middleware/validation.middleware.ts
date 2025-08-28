import {z} from 'zod'
import type {ZodError , ZodType} from 'zod'
import type {Response , Request , NextFunction} from 'express';     
import { genderEnum } from '../DB/models/user';
import { BadRequest } from '../utils/Response/error.response';


type keyReqType = keyof Request
type SchemaType = Partial<Record<keyReqType ,ZodType>>
type validationErrorType = Array<{key:keyReqType ;
     issues:Array<{message: string ; path :string | symbol | number | undefined;
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
        finalPath:z.string(),
        destination:z.string(),
        filename:z.string(),
        path:z.string(),
        size:z.number().positive()
    }
} 



export const Validation = (schema:SchemaType) => {
    return (req:Request , res:Response , next:NextFunction) : NextFunction =>{
        const validationError:validationErrorType = []
        for (const key of Object.keys(schema) as keyReqType[]) {
            if (!schema[key]) continue 
            const validationResult = schema[key].safeParse(req[key])
            if (!validationResult.success) {
                const errors = validationResult.error as ZodError
                validationError.push({key ,
                     issues:errors.issues.map((issue) => {
                        return{message:issue.message ,path:issue.path[0]}
                     })})
            }
            if (validationError.length) {
                throw new BadRequest("Validation Error" , {validationError})
            }

        } 
        return next() as unknown as NextFunction 
    }
}
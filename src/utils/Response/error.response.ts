import type {Response , Request , NextFunction} from 'express';

interface IError extends Error {
    statusCode : number
}

export class AppError extends Error{
    constructor(
        message: string,
        public statusCode : Number = 400,
        cause?: unknown
        ) {
        super(message , {cause})
        this.name = this.constructor.name
        Error.captureStackTrace(this , this.constructor)
        }        
}

export class BadRequest extends AppError {
    constructor(message:string , cause?:unknown) {
        super(message , 400 , cause)  
    }
}

export class NotFound extends AppError {
    constructor(message:string , cause?:unknown) {
        super(message , 404 , cause)  
    }
}

export class conflict extends AppError {
    constructor(message:string , cause?:unknown) {
        super(message , 409 , cause)  
    }
}

export class Forbidden extends AppError {
    constructor(message:string , cause?:unknown) {
        super(message , 403 , cause)  
    }
}

export class Unauthorized extends AppError {
    constructor(message:string , cause?:unknown) {
        super(message , 401 , cause)  
    }
}

export const globalErrorHandling = (error:IError & { cause?: unknown }, req:Request , res:Response , next: NextFunction) => {
      return res.status(error.statusCode || 500).json({
        error_message: error.message,
        cause:error.cause,
        stack: process.env.MOOD === "development" ? error.stack: undefined
      })
   }
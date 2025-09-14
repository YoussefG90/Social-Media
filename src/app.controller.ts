import type {Response , Request , Express} from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {resolve} from 'path';
import {config} from 'dotenv';
config({path:resolve("./config/.env.development")})
import connectDB from './DB/Connections'
import {authRouter , userRouter , postRouter} from './modules'
import { globalErrorHandling } from './utils/Response/error.response';


const bootstrap = (): void => {
   const app:Express = express();
   const port:number | string = process.env.PORT || 5000;
   app.use(express.json() , cors() , helmet())


   connectDB()
   
   //modules-routing
   app.use("/post", postRouter) 
   app.use("/auth", authRouter)  
   app.use("/user", userRouter)  

   //main-router
   app.get("/" , (req:Request , res:Response) => {
    res.json({message : `Wellcome To ${process.env.APP_NAME} App 🤍`});
   }) 

   app.use("{/*dummy}" , (req:Request , res:Response) => {
    res.status(404).json({message : "Error 404 Page Not Found 💀" });
   })

   app.use(globalErrorHandling)


   app.listen(port , () => {
     console.log(`Server is Running On Port :: ${port} ✔`);
   })
} 


export default bootstrap
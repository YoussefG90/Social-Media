import type {Response , Request , Express} from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {resolve} from 'path';
import {config} from 'dotenv';
config({path:resolve("./config/.env.development")})
import connectDB from './DB/Connections'
import {authRouter , userRouter , postRouter, initializeIo, schema} from './modules'
import { globalErrorHandling } from './utils/Response/error.response';
import { chatRouter } from './modules/chat';
import { createHandler } from 'graphql-http/lib/use/express';
import { authentication } from './middleware/auth.middleware';



const bootstrap = (): void => {
   const app:Express = express();
   const port:number | string = process.env.PORT || 5000;
   app.use(express.json() , cors() , helmet())

   app.all("/graphql" , authentication(),createHandler({schema:schema , context:(req)=>({user:req.raw.user})}))

   connectDB()
   
   //modules-routing
   app.use("/post", postRouter) 
   app.use("/auth", authRouter)  
   app.use("/user", userRouter)
   app.use("/chat", chatRouter)

   //main-router
   app.get("/" , (req:Request , res:Response) => {
    res.json({message : `Wellcome To ${process.env.APP_NAME} App 🤍`});
   }) 

   app.use("{/*dummy}" , (req:Request , res:Response) => {
    res.status(404).json({message : "Error 404 Page Not Found 💀" });
   })

   app.use(globalErrorHandling)


   const httpServer = app.listen(port , () => {
     console.log(`Server is Running On Port :: ${port} ✔`);
   })
   initializeIo(httpServer)

} 


export default bootstrap
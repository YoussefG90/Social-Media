import type {Response , Request} from 'express';
import { ILoginInputs, ISignupInputs } from './dto/dto.auth';
import UserModel from '../../DB/models/user';
import { BadRequest, conflict, NotFound } from '../../utils/Response/error.response';
import { customAlphabet } from 'nanoid';
import { compareHash, generateHash } from '../../utils/Security/Hash';
import { generateEncryption } from '../../utils/Security/Encryption';
import * as DBservices from '../../DB/DBservices';
import { emailEvent } from '../../utils/Events/email';
import { generateNewTokens } from '../../utils/Security/Token/Token';


export const generateotp = customAlphabet('0123456789', 6)



class AuthenticationService {
    constructor() {}

    signup = async (req:Request , res:Response) => {
        const otp = generateotp()
        const {firstName , lastName ,email, password , phone , gender , age} : ISignupInputs = req.body
        const checkuser = await DBservices.findOne({model:UserModel , filter :{email}})
        if (checkuser) {
           throw new conflict("Email Exist"  , 409)
        }
        const hashPassword = await generateHash({plaintext : password})
        const encryptOTP = await generateHash({plaintext : otp})
        const encryptePhone = await generateEncryption({plaintext : phone})
        const user = await DBservices.create({model:UserModel , data:{firstName , lastName , email , 
            password:hashPassword , phone:encryptePhone , age , gender,emailOTP:encryptOTP,
             emailOTPExpires: new Date(Date.now() + 3 * 60 * 1000)}})
        emailEvent.emit("Confirm Email", { to: email, otp });       
        res.status(201).json({message:"Account Created Check Your Email To Verify" , user})        
    }

    login = async (req:Request , res:Response) => {
        const {email , password}:ILoginInputs = req.body
        const user = await DBservices.findOne({model:UserModel , filter :{email , deletedAt:{$exists:false}}})
        if (!user) {
           throw new NotFound("User Not Found")
        }
        const checkOtp = await DBservices.findOne({model:UserModel , filter :{confirmEmail:true}})
        if (!checkOtp) {
           throw new BadRequest("Email Not Confirmed")
        }
        const checkpassword = await compareHash({plaintext:password , value:user.password})
        if (!checkpassword) {
            throw new BadRequest("InVaild Login Data")
        }
        const Tokens = await generateNewTokens({user})
        return res.status(200).json({message:"Done" , Tokens})
    }

 
    
}

export default new AuthenticationService()
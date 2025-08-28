import { Request, Response } from "express";
import { ILogoutDto } from "./user.dto";
import type { UpdateQuery } from "mongoose";
import UserModel, { HUserDocument, IUser } from "../../DB/models/user";
import { CreateLoginCredentials, createRevokeToken, logoutEnum } from "../../utils/Security/Token";
import { UserReposirotry } from "../../DB/repository/User.Repository";
import { TokenRepository } from "../../DB/repository/Token.Repository";
import { TokenModel } from "../../DB/models/token";
import { JwtPayload } from "jsonwebtoken";




class UserServices {
    private userModel = new UserReposirotry(UserModel)
    private tokenModel = new TokenRepository(TokenModel)
    constructor(){}

    profile = async (req : Request , res:Response) : Promise<Response> => {
        return res.json({message:"Done" , data:{user:req.user , decoded:req.decoded}})
    }


    logout = async (req : Request , res:Response) : Promise<Response> => {
        let statusCode = 200
        const {flag} : ILogoutDto = req.body
        const update: UpdateQuery<IUser> = {}
        switch (flag) {
            case logoutEnum.signoutFromAll:
                update.changeCredentialsTime = new Date()
                break;
        
            default:
                await createRevokeToken(req.decoded as JwtPayload)
                statusCode = 201
                break;
        }
        await this.userModel.updateOne({filter:{_id:req.decoded?._id},update})
        return res.status(statusCode).json({message:"Done"})
    }


    refreshToken = async (req : Request , res:Response) : Promise<Response>  => {
        const credentials = await CreateLoginCredentials(req.user as HUserDocument)
        await createRevokeToken(req.decoded as JwtPayload)
        return res.status(201).json({message:"Done" , data:{credentials}})
    }
}


export default new UserServices()
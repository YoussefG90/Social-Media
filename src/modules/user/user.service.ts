import { Request, Response } from "express";
import { ILogoutDto } from "./user.dto";
import type { UpdateQuery } from "mongoose";
import UserModel, { HUserDocument, IUser } from "../../DB/models/user";
import { CreateLoginCredentials, createRevokeToken, logoutEnum } from "../../utils/Security/Token";
import { UserReposirotry } from "../../DB/repository/User.Repository";
import { JwtPayload } from "jsonwebtoken";
import { destroyFile, uploadFile } from "../../utils/Multer/cloudinary";




class UserServices {
    private userModel = new UserReposirotry(UserModel)
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


    profileImage = async (req: Request,res: Response): Promise<Response> => {
    const { secure_url, public_id } = await uploadFile({
    file: req.file,path: `Users/${req.user?._id}/Profile`,});
    const user = await this.userModel.findOneAndUpdate({
    filter: { _id: req.user?._id },
    update: { profileImage: { secure_url, public_id } },
    });
    if ((user as any)?.profileImage?.public_id) {
    await destroyFile({public_id: (user as any).profileImage.public_id,});
    }
    return res.status(201).json({ message: "Profile Picture Uploaded" });
    };

    coverImage = async (req: Request, res: Response): Promise<Response> => {
    const { secure_url, public_id } = await uploadFile({
    file: req.file,
    path: `Users/${req.user?._id}/Cover`,
    });
    const user = await this.userModel.findOneAndUpdate({
    filter: { _id: req.user?._id },
    update: { coverImages: { secure_url, public_id } },
    });
      if (user?.coverImages && "public_id" in (user.coverImages as any)) {
    await destroyFile({
      public_id: (user.coverImages as any).public_id,
    });
      }
    return res.status(201).json({ message: "Cover Image Uploaded"});
    };
}

export default new UserServices()
import { Request, Response } from "express";
import { IFreezeAccountDto, IHardDeleteDto, ILogoutDto, IRestoreAccountDto } from "./user.dto";
import type { UpdateQuery } from "mongoose";
import UserModel, { HUserDocument, IUser, roleEnum } from "../../DB/models/user";
import { CreateLoginCredentials, createRevokeToken, logoutEnum } from "../../utils/Security/Token";
import { UserReposirotry } from "../../DB/repository/User.Repository";
import { JwtPayload } from "jsonwebtoken";
import { destroyFile, uploadFile } from "../../utils/Multer/cloudinary";
import { successResponse } from "../../utils/Response/success.response";
import { IUserResponse } from "./user.entities";
import { Forbidden, NotFound, Unauthorized } from "../../utils/Response/error.response";
import { ILoginResponse } from "../auth/auth.entities";




class UserServices {
    private userModel = new UserReposirotry(UserModel)
    constructor(){}

    profile = async (req : Request , res:Response) : Promise<Response> => {
      if (!req.user) {
        throw new Unauthorized("Missing User Details")
      }
        return successResponse<IUserResponse>({res , data:{user:req.user}})
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
        return successResponse({res , statusCode})
    }


    refreshToken = async (req : Request , res:Response) : Promise<Response>  => {
        const Tokens = await CreateLoginCredentials(req.user as HUserDocument)
        await createRevokeToken(req.decoded as JwtPayload)
        return successResponse<ILoginResponse>({res , data:{Tokens}})
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
    return successResponse({res , statusCode:201 ,message: "Profile Picture Uploaded" })
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
    return successResponse({res , statusCode:201 ,message: "Cover Image Uploaded" })  
    };

    freezeAccount = async (req: Request,res: Response): Promise<Response> => {
      const {userId} = req.params
      if (userId && req.user?.role !== roleEnum.admin) {
        throw new Forbidden("Not Authorized User")
      }
      const user = await this.userModel.updateOne({
        filter:{_id:userId || req.user?._id , freezeAt: {$exists:false}},
        update:{
          freezeAt:new Date(),
          freezeBy:req.user?._id,
          changeCredentialsTime:new Date(),
          $unset:{
            restoreAt:1,
            restoreBy:1
          }
        }

      })
      if (!user.matchedCount) {
        throw new NotFound("User Not Found Or Fail To Delete")
      }
      return successResponse({res})
    }

    restoreAccount = async (req: Request,res: Response): Promise<Response> => {
      const {userId} = req.params as IRestoreAccountDto
      const user = await this.userModel.updateOne({
        filter:{_id:userId, freezeBy: {$ne:userId}},
        update:{
          restoreAt:new Date(),
          restoreBy:req.user?._id,
          $unset:{
            freezeAt:1,
            freezeBy:1
          }
        }

      })
      if (!user.matchedCount) {
        throw new NotFound("User Not Found Or Fail To Restore")
      }
      return successResponse({res})
    }

      hardDelete = async (req: Request,res: Response): Promise<Response> => {
      const {userId} = req.params as IHardDeleteDto
      const user = await this.userModel.deleteOne({
        filter:{_id:userId, freezeAt: {$exists:true}}
      })
      if (!user.deletedCount) {
        throw new NotFound("User Not Found Or Fail To Hard Delelte")
      }
      return successResponse({res})
    }

}

export default new UserServices()
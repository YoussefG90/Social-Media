import { Request, Response } from "express";
import {IHardDeleteDto, ILogoutDto, IRestoreAccountDto, UpdateBasicInfoDto, UpdatePassword } from "./user.dto";
import type { UpdateQuery } from "mongoose";
import UserModel, { HUserDocument, IUser, roleEnum } from "../../DB/models/user";
import { CreateLoginCredentials, createRevokeToken, logoutEnum } from "../../utils/Security/Token";
import { UserReposirotry } from "../../DB/repository";
import { JwtPayload } from "jsonwebtoken";
import { destroyFile, uploadFile } from "../../utils/Multer/cloudinary";
import { successResponse } from "../../utils/Response/success.response";
import { IUserResponse } from "./user.entities";
import { BadRequest, Forbidden, NotFound, Unauthorized } from "../../utils/Response/error.response";
import { ILoginResponse } from "../auth/auth.entities";
import { generateDecryption, generateEncryption } from "../../utils/Security/Encryption";
import { compareHash, generateHash } from "../../utils/Security/Hash";




class UserServices {
    private userModel = new UserReposirotry(UserModel)
    constructor(){}

    profile = async (req : Request , res:Response) : Promise<Response> => {
      if (!req.user) {
        throw new Unauthorized("Missing User Details")
      }
       req.user.phone = generateDecryption({ciphertext:req.user.phone as string}) 
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
    const oldUser = await this.userModel.findOne({filter:{_id:req.user?._id}})
    if (oldUser?.profileImage?.public_id) {
      await destroyFile({ public_id: oldUser.profileImage.public_id });
    }
    const { secure_url, public_id } = await uploadFile({
    file: req.file,
    path: `Users/${req.user?._id}/Profile`,});
    await this.userModel.findOneAndUpdate({
    filter: { _id: req.user?._id }, 
    update: { profileImage: { secure_url, public_id } },
    });
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

    updateBasicInfo = async(req: Request<any, any, UpdateBasicInfoDto>,res: Response): Promise<Response> => {
      if (await this.userModel.findOne({filter:{_id:req.user?._id , freezeAt:{$exists:true}}})) {
        throw new NotFound("User Not Found")
      }
      if (req.body.phone) {
        req.body.phone = generateEncryption({plaintext:req.body.phone})
      }
      await this.userModel.updateOne({filter:{_id:req.user?._id} , update:{...req.body}})
      return successResponse({res , message:"User Updated Successfully"})
    }

    updatePassword = async(req: Request<any, any, UpdatePassword>,res: Response): Promise<Response> => {
       const {oldPassword , newPassword} = req.body
       if (await this.userModel.findOne({filter:{_id:req.user?._id , freezeAt:{$exists:true}}})) {
        throw new NotFound("User Not Found")
      }
      if (!req.user?.password) {
        throw new BadRequest("User Data Not Exist")
      }
      const unHashPassword = await compareHash({plaintext:oldPassword , value:req.user?.password as string})
      if (!unHashPassword) {
        throw new BadRequest("Invalid Old Password")
      }
      const newHash = await generateHash({plaintext:newPassword})
      await this.userModel.updateOne({filter:{_id:req.user?._id} , update:{password:newHash}})
      return successResponse({res , message:"Password Updated Successfully"})
    }

    updateEmail = async(req: Request,res: Response): Promise<Response> => {

        const user = await this.userModel.findOne({filter:{resetEmail:{$exists:true}}})
        if (!user) {
          throw new BadRequest("Please Confirm Email OTP")
        }
        await this.userModel.updateOne({filter:{_id:req.user?._id} , update:{
                $set: { email: user.tempEmail },
                $unset: { tempEmail: 0, resetEmail: 0 }
        }})
      return successResponse({res , message:"Email Updated Successfully"})
    }

}

export default new UserServices()
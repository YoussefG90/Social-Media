import { Request, Response } from "express";
import {IHardDeleteDto, ILogoutDto, IRestoreAccountDto, UpdateBasicInfoDto, UpdatePassword } from "./user.dto";
import type { Types, UpdateQuery } from "mongoose";
import UserModel, { HUserDocument, IUser, roleEnum } from "../../DB/models/user";
import { CreateLoginCredentials, createRevokeToken, logoutEnum } from "../../utils/Security/Token";
import { FriendRequestRepository, PostRepository, UserReposirotry } from "../../DB/repository";
import { JwtPayload } from "jsonwebtoken";
import { destroyFile, uploadFile } from "../../utils/Multer/cloudinary";
import { successResponse } from "../../utils/Response/success.response";
import { IUserResponse } from "./user.entities";
import { BadRequest, conflict, Forbidden, NotFound} from "../../utils/Response/error.response";
import { ILoginResponse } from "../auth/auth.entities";
import { generateEncryption } from "../../utils/Security/Encryption";
import { compareHash, generateHash } from "../../utils/Security/Hash";
import { FriendRequestModel, PostModel } from "../../DB/models";




class UserServices {
    private userModel = new UserReposirotry(UserModel)
    private postModel = new PostRepository(PostModel)
    private friendRequestModel = new FriendRequestRepository(FriendRequestModel)
    constructor(){}

    profile = async (req : Request , res:Response) : Promise<Response> => {
      const profile = await this.userModel.findOne({filter:{_id:req.user?._id}, options:{
        populate:[{path:"friends" , select:"firstName lastName email gender profileImage phone"}]
      }})
      if (!profile) {
        throw new NotFound("User Not Found")
      }
        return successResponse<IUserResponse>({res , data:{user:profile}})
    }
    
    dashboard = async (req : Request , res:Response) : Promise<Response> => {
      const results = await Promise.allSettled([
        this.userModel.find({filter:{}}),
        this.postModel.find({filter:{}})
      ])
        return successResponse({res , data:{results}})
    }


    changeRole = async (req : Request , res:Response) : Promise<Response> => {
      const {userId} = req.params as unknown as {userId:Types.ObjectId}
      const {role}:{role:roleEnum} = req.body
      const denyRoles:roleEnum[] = [role, roleEnum.superAdmin]
      if (req.user?.role === roleEnum.admin) {
        denyRoles.push(roleEnum.admin)
      }
      const user = await this.userModel.findOneAndUpdate({filter:{
        _id:userId as Types.ObjectId , role:{$nin:denyRoles}
      },update:{role}
    })
    if (!user) {
      throw new NotFound("User Not Found")
    }
        return successResponse({res})
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

    
    sendFriendRequest = async(req: Request,res: Response): Promise<Response> => {
          const {userId} = req.params as unknown as {userId:Types.ObjectId}
          if (req.user?._id.toString() === userId.toString()) {
              throw new BadRequest("You cannot send a friend request to yourself");
          }
        const checkRequest = await this.friendRequestModel.findOne({
          filter:{
            createdBy:{$in:[req.user?._id,userId]},
            sentTo:{$in:[req.user?._id,userId]},
          }})
          if (checkRequest) {
            throw new conflict("Friend Request Already Exist")
          }
          const user = await this.userModel.findOne({filter:{_id:userId}})
          if (!user) {
            throw new NotFound("User Not Found")
          }
          const [friendRequest] = await this.friendRequestModel.create({data:[{
            createdBy:req.user?._id as Types.ObjectId , sentTo:userId
          }]}) || []
          if (!friendRequest) {
            throw new BadRequest("Fail To Send Friend Request")
          }
      return successResponse({res ,statusCode:201, message:"Friend Request Sent Successfully"})
    }


        acceptFriendRequest = async(req: Request,res: Response): Promise<Response> => {
          const {requestId} = req.params as unknown as {requestId:Types.ObjectId}
          const friendRequest = await this.friendRequestModel.findOneAndUpdate({
          filter:{
           _id:requestId, sentTo:req.user?._id,acceptedAt:{$exists:false}
          },update:{acceptedAt:new Date()}
        })
          if (!friendRequest) {
            throw new conflict("Fail To Accept Friend Request")
          }
          await Promise.all([
            await this.userModel.updateOne({filter:{_id:friendRequest.createdBy},
            update:{$addToSet:{friends:friendRequest.sentTo}}}),
            await this.userModel.updateOne({filter:{_id:friendRequest.sentTo},
            update:{$addToSet:{friends:friendRequest.createdBy}}})
          ])
      return successResponse({res, message:"Friend Request Accepted Successfully"})
    }

}

export default new UserServices()
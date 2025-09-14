import type { Request, Response } from "express"
import { successResponse } from "../../utils/Response/success.response"
import { PostRepository, UserReposirotry } from "../../DB/repository"
import { HPostDocument, LikeActionEnum, PostModel } from "../../DB/models/post"
import {UserModel} from "../../DB/models/user"
import { BadRequest, NotFound } from "../../utils/Response/error.response"
import {v4 as uuid} from 'uuid'
import { destroyResources, uploadFiles } from "../../utils/Multer/cloudinary"
import { ILikePostInputsDto } from "./post.dto"
import { UpdateQuery } from "mongoose"



class PostService {
    private postModel = new PostRepository(PostModel)
    private userModel = new UserReposirotry(UserModel)
    constructor() {}

    createPost = async (req:Request , res:Response):Promise<Response> =>{
       if (req.body.tags?.length &&(await this.userModel.find({
        filter: { _id: { $in: req.body.tags } }
        })).length !== req.body.tags.length
        ) {
        throw new NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments: { secure_url: string; public_id: string }[] = [];
        let assistFolderId:string = uuid()

        if (req.files?.length) {
            attachments = await uploadFiles({
             files:req.files as Express.Multer.File[],
             path: `users/${req.user?._id}/post/${assistFolderId}`
            })
        }
        const [post] = await this.postModel.create({data:[{
            ...req.body , attachments , assistFolderId , createdBy:req.user?._id
        }]}) || []
        if (!post) {
            if (attachments.length) {
             await destroyResources({
            public_ids: attachments.map(a => a.public_id)
             });
             }
                 throw new BadRequest("Fail To Publish The Post");
            }
        return successResponse({res , statusCode:201})
    }

    likePost = async (req:Request , res:Response):Promise<Response> => {
        const {postId} = req.params as {postId:string}
        const {action} = req.query as ILikePostInputsDto
        let update: UpdateQuery<HPostDocument> = {
            $addToSet:{likes : req.user?._id}
        }
        if (action === LikeActionEnum.unlike) {
            update = {$pull:{likes : req.user?._id}}
        }
        const post = await this.postModel.findOneAndUpdate({
            filter:{_id:postId}, update
        })
        if (!post) {
            throw new BadRequest("Post Not Exist")
        }
        return successResponse({res})
    }

}


export default new PostService()
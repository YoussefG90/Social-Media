import type { Request, Response } from "express"
import { successResponse } from "../../utils/Response/success.response"
import { CommentRepository, PostRepository, UserReposirotry } from "../../DB/repository"
import {AllowCommentsEnum, HPostDocument, LikeActionEnum, PostModel } from "../../DB/models/post"
import {UserModel} from "../../DB/models/user"
import { BadRequest, Forbidden, NotFound } from "../../utils/Response/error.response"
import {v4 as uuid} from 'uuid'
import { destroyResources, uploadFiles } from "../../utils/Multer/cloudinary"
import { ILikePostInputsDto } from "./comment.dto"
import { Types, UpdateQuery } from "mongoose"
import { postAvailability } from "../post"
import { CommentModel } from "../../DB/models"



class CommentService {
    private postModel = new PostRepository(PostModel)
    private userModel = new UserReposirotry(UserModel)
    private commentModel = new CommentRepository(CommentModel)
    constructor() {} 

    createComment = async (req:Request , res:Response):Promise<Response> =>{
        const {postId} = req.params as unknown as {postId:Types.ObjectId}
        const post = await this.postModel.findOne({filter:{
            _id:postId,allowComments:AllowCommentsEnum.Allow,
            $or:postAvailability(req)
        }})
        if (!post) {
            throw new NotFound("Comment Not Found")
        }
       if (req.body.tags?.length &&(await this.userModel.find({
        filter: { _id: { $in: req.body.tags , $ne:req.user?._id} }
        })).length !== req.body.tags.length
        ) {
        throw new NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments: { secure_url: string; public_id: string }[] = [];

        if (req.files?.length) {
            attachments = await uploadFiles({
             files:req.files as Express.Multer.File[],
             path: `users/${post.createdBy}/post/${post.assistFolderId}`
            })
        }
        const [comment] = await this.commentModel.create({data:[{
            ...req.body , attachments , postId , createdBy:req.user?._id
        }]}) || []
        if (!comment) {
            if (attachments.length) {
             await destroyResources({
            public_ids: attachments.map(a => a.public_id)
             });
             }
                 throw new BadRequest("Fail To Publish The Comment");
            }
        return successResponse({res , statusCode:201})
    }

    replyOnComment = async (req:Request , res:Response):Promise<Response> =>{
        const {postId , commentId} = req.params as unknown as {postId:Types.ObjectId,commentId:Types.ObjectId}
        const comment = await this.commentModel.findOne({filter:{
            _id:commentId,postId
        },options:{
            populate:[{path:"postId" , match : {
                allowComments:AllowCommentsEnum.Allow,$or:postAvailability(req)
            }}]
        }
    })
        if (!comment?.postId) {
            throw new NotFound("Comment Not Found")
        }
       if (req.body.tags?.length &&(await this.userModel.find({
        filter: { _id: { $in: req.body.tags , $ne:req.user?._id} }
        })).length !== req.body.tags.length
        ) {
        throw new NotFound("Sorry Some Users Taged Not Exist");
        }
        let attachments: { secure_url: string; public_id: string }[] = [];

        if (req.files?.length) {
            const post = comment.postId as Partial<HPostDocument>
            attachments = await uploadFiles({
             files:req.files as Express.Multer.File[],
             path: `users/${post.createdBy}/post/${post.assistFolderId}`
            })
        }
        const [reply] = await this.commentModel.create({data:[{
            ...req.body , attachments ,commentId, postId , createdBy:req.user?._id
        }]}) || []
        if (!reply) {
            if (attachments.length) {
             await destroyResources({
            public_ids: attachments.map(a => a.public_id)
             });
             }
                 throw new BadRequest("Fail To Publish The Comment");
            }
        return successResponse({res , statusCode:201})
    }

    updatePost = async (req:Request , res:Response):Promise<Response> =>{
        const {postId} = req.params as unknown as {postId:Types.ObjectId}
        const findPost  = await this.postModel.findOne({filter:{_id: postId, createdBy:req.user?._id}})
        if (!findPost) {
            throw new NotFound("Post Not Found")
        }
       if (req.body.tags?.length &&(await this.userModel.find({
        filter: { _id: { $in: req.body.tags , $ne:req.user?._id} }
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
        const updatedPost = await this.postModel.updateOne({filter:{_id:findPost._id},
            update:[
            {
            $set: {
                content: req.body.content,
                allowComments: req.body.allowComments ?? findPost.allowComments,
                availability: req.body.availability ?? findPost.availability,
                attachments: {
                $concatArrays: [
                    {
                    $filter: {
                        input: "$attachments",
                        as: "a",
                        cond: { $not: { $in: ["$$a.public_id", req.body.removedAttachments || []] } }
                    }
                    },
                    attachments 
                ]
                },
                  tags: {
                $setUnion: [
                    {
                    $setDifference: ["tags",(req.body.removedTags || []).map((tag:string)=>{
                        return Types.ObjectId.createFromHexString(tag)
                    })]
                    },
                    (req.body.tags || []).map((tag:string)=>{
                        return Types.ObjectId.createFromHexString(tag)})
                    ]
                },
                assistFolderId: findPost.assistFolderId
                  }
                }
                ]})
        if (!updatedPost) {
            if (attachments.length) {
             await destroyResources({
            public_ids: attachments.map(a => a.public_id)
             });
             }
                 throw new BadRequest("Fail To Publish The Post");
            }
        return successResponse({res})
    }


    getAllPosts = async (req:Request , res:Response):Promise<Response> => {
        let {page , size} = req.query as unknown as {page:number;size:number;}
        const posts = await this.postModel.paginate({
            filter:{$or:postAvailability(req)},page,size
        })
        if (!posts) {
            throw new BadRequest("Post Not Exist")
        }
        return successResponse({res , data:{posts}})
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
            filter:{_id:postId , $or:postAvailability(req)}, update
        })
        if (!post) {
            throw new BadRequest("Post Not Exist")
        }
        return successResponse({res})
    }

    freezeComment = async (req: Request, res: Response): Promise<Response> => {
        const { postId, commentId } = req.params as unknown as {postId:Types.ObjectId ,commentId:Types.ObjectId};
        if (!req.user?._id) {
            throw new Forbidden("Not Authorized User");
        }

        const comment = await this.commentModel.updateOne(
            {filter:{
            _id: commentId,postId,
            createdBy: req.user._id,
            freezedAt: { $exists: false },
            },update:
            {
            freezedAt: new Date(),
            freezedBy: req.user._id,
            $unset: {
                restoreAt: 1,
                restoredBy: 1,
            },
            }}
        );

        if (!comment.matchedCount) {
            throw new NotFound("Comment Not Found Or You Are Not The Owner");
        }

        return successResponse({ res });
        };

        hardDeleteComment = async (req: Request, res: Response): Promise<Response> => {
            const { commentId } = req.params as unknown as { commentId: Types.ObjectId };

            if (!req.user?._id) throw new Forbidden("Not Authorized User");

            const result = await this.commentModel.deleteOne({filter:{
                _id: commentId,
                createdBy: req.user._id, 
                freezedAt:{$exists:true}
        }});

            if (!result.deletedCount) {
                throw new NotFound("Comment Not Found Or You Are Not The Owner");
            }

            return successResponse({ res });
            };

}


export const commentService = new CommentService()
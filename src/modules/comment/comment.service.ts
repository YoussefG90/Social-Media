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
import { CommentModel, HCommentDocument } from "../../DB/models"



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


    updateComment = async (req: Request, res: Response): Promise<Response> => {
  const { postId, commentId } = req.params as unknown as {
    postId: Types.ObjectId;
    commentId: Types.ObjectId;
  };

  const findComment = await this.commentModel.findOne({filter:{
    _id: commentId,
    postId: postId,
    createdBy: req.user?._id
  }
  });

  if (!findComment) {
    throw new NotFound("Comment Not Found");
  }
  let attachments: { secure_url: string; public_id: string }[] = [];
  let assistFolderId: string = uuid();
  if (req.files?.length) {
    attachments = await uploadFiles({
      files: req.files as Express.Multer.File[],
      path: `users/${req.user?._id}/comments/${assistFolderId}`
    });
  }
  const updatedComment = await this.commentModel.updateOne({
    filter:{ _id: findComment._id },
    update:[
      {
        $set: {
          content: req.body.content ?? findComment.content,
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
        }
      }
    ]
    });

  if (!updatedComment) {
    if (attachments.length) {
      await destroyResources({
        public_ids: attachments.map((a) => a.public_id)
      });
    }
    throw new BadRequest("Fail To Update Comment");
  }

  return successResponse({ res });
};



 getAllComments = async (req: Request, res: Response): Promise<Response> => {
  const { postId } = req.params as unknown as { postId: Types.ObjectId };
  let { page, size } = req.query as unknown as { page: number; size: number };
  const comments = await this.commentModel.paginate({
    filter: { postId },
    page,
    size
  });
  if (!comments) {
    throw new BadRequest("Comments Not Exist");
  }
  return successResponse({ res, data: { comments } });
};



likeComment = async (req: Request, res: Response): Promise<Response> => {
  const { postId, commentId } = req.params as { postId: string; commentId: string };
  const { action } = req.query as ILikePostInputsDto;

  let update: UpdateQuery<HCommentDocument> = {
    $addToSet: { likes: req.user?._id }
  };

  if (action === LikeActionEnum.unlike) {
    update = { $pull: { likes: req.user?._id } };
  }

  const comment = await this.commentModel.findOneAndUpdate({
    filter:{ _id: commentId, postId },
    update
});

  if (!comment) {
    throw new BadRequest("Comment Not Exist");
  }

  return successResponse({ res });
};


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
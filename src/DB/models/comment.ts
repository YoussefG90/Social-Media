import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { emailEvent } from "../../utils/Events/email";
import UserModel from "./user";
import { IPost } from "./post";


export interface IComment {
    content?:string;
    attachments?:{ secure_url: string; public_id: string }[];

    likes?:Types.ObjectId[];
    tags?:Types.ObjectId[];
    createdBy:Types.ObjectId;
    postId:Types.ObjectId | Partial<IPost>;
    commentId?:Types.ObjectId;
    freezedAt?:Date;
    freezedBy?:Types.ObjectId;
    restoreAt?:Date;
    restoredBy?:Types.ObjectId;

    createdAt:Date;
    updatedAt:Date;
}


const commentSchema = new Schema<IComment> ({
    content:{type:String ,minlength : 2 , maxlength:500000 , required:function(){
        return !this.attachments?.length
    }},
    attachments:[{secure_url: { type: String },public_id: { type: String }}],
    likes:[{type:Schema.Types.ObjectId ,ref:"User"}],
    tags:[{type:Schema.Types.ObjectId ,ref:"User"}],
    createdBy:{type:Schema.Types.ObjectId ,ref:"User" , required:true},
    postId:{type:Schema.Types.ObjectId ,ref:"Post" , required:true},
    commentId:{type:Schema.Types.ObjectId ,ref:"Comment"},
    freezedAt:Date,
    freezedBy:{type:Schema.Types.ObjectId ,ref:"User"},
    restoreAt:Date,
    restoredBy:{type:Schema.Types.ObjectId ,ref:"User"},
},{
    timestamps:true,
    strictQuery:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})


commentSchema.post("save", async function (doc) {
  if (doc.tags?.length) {
    const users = await UserModel.find({ _id: { $in: doc.tags } });
    for (const user of users) {
      if (user.email) {
        emailEvent.emit("Tagged in Post", {
          to: user.email,
          otp: `You were tagged in a new post by user ${doc.createdBy}`,
        });
      }
    }
  }
});

commentSchema.pre(["findOneAndUpdate", "updateOne" ], function (next) {
  const query = this.getQuery()
  if (query.paranoid === false) {
    delete query.paranoid
    this.setQuery({ ...query })
  } else {
    delete query.paranoid
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }
  next()
})

commentSchema.pre(["find" , "findOne", "countDocuments"] , function(next){
   const query = this.getQuery()
  if (query.paranoid === false) {
    delete query.paranoid
    this.setQuery({ ...query })
  } else {
    delete query.paranoid
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }
  next()
})

commentSchema.virtual("reply",{
  localField:"_id",
  foreignField:"commentId",
  ref:"Comment",
  justOne:true
})

export const CommentModel = models.comment || model<IComment>("Comment" , commentSchema)
export type HCommentDocument = HydratedDocument<IComment>
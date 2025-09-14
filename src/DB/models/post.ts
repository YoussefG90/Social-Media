import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { emailEvent } from "../../utils/Events/email";
import UserModel from "./user";


export enum AvailabilityEnum {
    public = "public",
    private = "private",
    onlyMe = "Only-Me"
}

export enum AllowCommentsEnum {
    Allow = "Allow",
    Deny = "Deny"
}

export enum LikeActionEnum {
    like = "like",
    unlike = "unlike"
}

export interface IPost {
    content?:string;
    attachments?:{ secure_url: string; public_id: string }[];
    assistFolderId:string;
    availability:AvailabilityEnum;
    allowComments:AllowCommentsEnum;
    likes?:Types.ObjectId[];
    tags?:Types.ObjectId[];
    createdBy:Types.ObjectId;
    freezedAt?:Date;
    freezedBy?:Types.ObjectId;
    restoreAt?:Date;
    restoredBy?:Types.ObjectId;

    createdAt:Date;
    updatedAt:Date;
}


const postSchema = new Schema<IPost> ({
    content:{type:String ,minlength : 2 , maxlength:500000 , required:function(){
        return !this.attachments?.length
    }},
    attachments:[{secure_url: { type: String },public_id: { type: String }}],
    assistFolderId:{type:String , required:true},
    availability:{type:String , enum:AvailabilityEnum , default:AvailabilityEnum.public},
    allowComments:{type:String , enum:AllowCommentsEnum , default:AllowCommentsEnum.Allow},
    likes:[{type:Schema.Types.ObjectId ,ref:"User"}],
    tags:[{type:Schema.Types.ObjectId ,ref:"User"}],
    createdBy:{type:Schema.Types.ObjectId ,ref:"User" , required:true},
    freezedAt:Date,
    freezedBy:{type:Schema.Types.ObjectId ,ref:"User"},
    restoreAt:Date,
    restoredBy:{type:Schema.Types.ObjectId ,ref:"User"},
},{
    timestamps:true,
    strictQuery:true
})


postSchema.post("save", async function (doc) {
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

postSchema.pre(["findOneAndUpdate" , "updateOne"] , function(next){
   const query = this.getQuery()
  if (query.paranoid === false) {
    this.setQuery({...query})
  }else{
    this.setQuery({...query , freezedAt:{$exists:true}})
  }
  next()
})

export const PostModel = models.Post || model<IPost>("Post" , postSchema)
export type HPostDocument = HydratedDocument<IPost>
import { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface IMessage {
    content:string;
    createdBy:Types.ObjectId;
    createdAt?:Date;
    updatedAt?:Date;
}

export type HMessageDocument = HydratedDocument<IMessage>

export interface IChat {
    particpants:Types.ObjectId[];
    createdBy:Types.ObjectId;
    messages:IMessage[];
    group?:string
    group_image?:{ secure_url: string; public_id: string };
    roomId?:string
    createdAt?:Date;
    updatedAt?:Date;
}


const messageSchema = new Schema<IMessage>({
  content:{type:String , minlength:2 , maxlength:500000, required:true},
  createdBy:{type:Schema.Types.ObjectId ,ref:"User" , required:true},
},
  {
    timestamps:true
  })

const chatSchema = new Schema<IChat> ({
    group:{type:String},
    group_image:{secure_url: { type: String },public_id: { type: String }},
    particpants:[{type:Schema.Types.ObjectId ,ref:"User" , required:true}],
    roomId:{type:String , required:function(){return this.roomId}},
    createdBy:{type:Schema.Types.ObjectId ,ref:"User" , required:true},
    messages:[messageSchema],
},{
    timestamps:true,
})


export const ChatModel = models.chat || model<IChat>("chat" , chatSchema)
export type HChatDocument = HydratedDocument<IChat>
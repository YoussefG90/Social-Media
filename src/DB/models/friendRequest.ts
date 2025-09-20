import { HydratedDocument, model, models, Schema, Types } from "mongoose";




export interface IFriendRequest {

    createdBy:Types.ObjectId;
    acceptedAt?:Date;
    sentTo:Types.ObjectId;

    createdAt:Date;
    updatedAt:Date;
}


const friendRequestSchema = new Schema<IFriendRequest> ({
    
    
 
    createdBy:{type:Schema.Types.ObjectId ,ref:"User" , required:true},
    sentTo:{type:Schema.Types.ObjectId ,ref:"User" , required:true},
    acceptedAt:Date,
},{
    timestamps:true,
    strictQuery:true,
})



friendRequestSchema.pre(["findOneAndUpdate", "updateOne" ], function (next) {
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

friendRequestSchema.pre(["find" , "findOne", "countDocuments"] , function(next){
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


export const FriendRequestModel = models.friendRequest || model<IFriendRequest>("FriendRequest" , friendRequestSchema)
export type HfriendRequestDocument = HydratedDocument<IFriendRequest>
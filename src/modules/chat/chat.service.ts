import type { Request, Response } from "express";
import { ICreateChatGroupDto, IGetChatDtoParams, IGetChatDtoQuery, IGetGroupDtoParams, IJoinRoomDto, ISayHiDto, ISendGroupMessageDto, ISendMessageDto } from "./chat.dto";
import { successResponse } from "../../utils/Response/success.response";
import { ChatRepository, UserReposirotry } from "../../DB/repository";
import { ChatModel, UserModel } from "../../DB/models";
import { Types } from "mongoose";
import { BadRequest, NotFound } from "../../utils/Response/error.response";
import { IGetChatResponse } from "./chat.entities";
import { connectedSockets } from "../gateway";
import { destroyFile, uploadFile } from "../../utils/Multer/cloudinary";
import {v4 as uuid} from 'uuid'




export class ChatService {
    private chatModel:ChatRepository = new ChatRepository(ChatModel)
    private userModel:UserReposirotry = new UserReposirotry(UserModel)
    constructor(){}


    getChat = async (req:Request , res:Response):Promise<Response> => {
        const {userId} = req.params as IGetChatDtoParams
        const {page , size}:IGetChatDtoQuery = req.query
        const chat = await this.chatModel.findOneChat({filter:{
            particpants:{$all:[
                req.user?._id as Types.ObjectId,
                Types.ObjectId.createFromHexString(userId)
            ]},group:{$exists:false}
        },options:{
            populate:[{
                path:"particpants",select:"firstName lastName email gender profileImage"
            }]
        },page,size})
        if (!chat) {
            throw new BadRequest("Fail To Find Chat")
        }
        return successResponse<IGetChatResponse>({res, data:{chat}})
    }

    sayHi = ({message , socket , callback ,io}:ISayHiDto) => {
        try {
            console.log({message});
            callback?callback("Hello FE"):undefined 
        } catch (error) {
            socket.emit("custom_error",error)
        }
    }

    sendMessage = async ({content,sendTo , socket ,io}:ISendMessageDto) => {
        try {
            const createdBy = socket.credentials?.user._id as Types.ObjectId 
            const user = await this.userModel.findOne({
                filter:{
                    _id:Types.ObjectId.createFromHexString(sendTo),
                    friends:{$in:createdBy}
                }
            })
            if (!user) {
                throw new NotFound("Invalid Recipient Friend")
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter:{
                     particpants:{$all:[
                    createdBy as Types.ObjectId,
                    Types.ObjectId.createFromHexString(sendTo)
                 ]},group:{$exists:false}
                    
                },
                update:{
                    $addToSet:{messages:{content,createdBy}}
                }
            })
            if (!chat) {
                const [newChat] = (await this.chatModel.create({
                    data:[{
                        createdBy,messages:[{content,createdBy}],
                        particpants:[
                            createdBy as Types.ObjectId,
                            Types.ObjectId.createFromHexString(sendTo)]
                    }]
                })) || []
                if (!newChat) {
                    throw new BadRequest("Fail To Create Chat")
            }
            }
            io?.to(connectedSockets.get(createdBy.toString() as string) as string[]
                ).emit("successMessage",{content})
            io?.to(connectedSockets.get(sendTo) as string[]
                ).emit("newMessage",{content , from:socket.credentials?.user})
        } catch (error) {
            socket.emit("custom_error",error)
        }
    }

    sendGroupMessage = async ({content,groupId , socket ,io}:ISendGroupMessageDto) => {
        try {
            const createdBy = socket.credentials?.user._id as Types.ObjectId 

            const chat = await this.chatModel.findOneAndUpdate({
                filter:{
                    _id:Types.ObjectId.createFromHexString(groupId),
                     particpants:{$in:createdBy as Types.ObjectId},
                     group:{$exists:true}
                },
                update:{
                    $addToSet:{messages:{content,createdBy}}
                }
            })
            if (!chat) {
                throw new BadRequest("Fail To Find Group")
            }
            io?.to(connectedSockets.get(createdBy.toString() as string) as string[]
                ).emit("successMessage",{content})
            socket?.to(chat.roomId as string).emit("newMessage",{content , from:socket.credentials?.user , groupId})
        } catch (error) {
            socket.emit("custom_error",error)
        }
    }


    joinRoom = async ({roomId , socket ,io}:IJoinRoomDto) => {
        try {
            const chat = await this.chatModel.findOne({
                filter:{roomId,group:{$exists:true},
                particpants:{$in:socket.credentials?.user._id}}
            })
            if (!chat) {
                throw new BadRequest("Fail To Join Room")
            }
            socket.join(chat.roomId as string)
        } catch (error) {
            socket.emit("custom_error",error)
        }
    }

    createGroup = async (req:Request , res:Response):Promise<Response> => {
        const {group,participants}:ICreateChatGroupDto = req.body
        const dbParticipants = participants.map((participants:string)=>{
            return Types.ObjectId.createFromHexString(participants)
        })
        const users = await this.userModel.find({
            filter:{
                _id:{$in:dbParticipants},
                friends:{$in:req.user?._id as Types.ObjectId}
            }
        })
        if (participants.length != users.length) {
                throw new NotFound("Some Or All Users Invalid")
            }
        const roomId = group.replaceAll(/\s+/g,"_") + "_" + uuid()    
        const { secure_url, public_id } = await uploadFile({
             file: req.file,
             path: `Chat/${roomId}`,});
            dbParticipants.push(req.user?._id as Types.ObjectId) 
            const [newGroup] = await this.chatModel.create({
             data: [{createdBy:req.user?._id as Types.ObjectId,group,roomId,
                group_image:{ secure_url, public_id },
                messages:[],particpants:dbParticipants
             }],
             }) || []; 
        if (!newGroup) {
              if (public_id) {
            await destroyFile({ public_id })
        }  
            throw new BadRequest("Fail To Create Group")
        } 
        
        return successResponse<IGetChatResponse>({res ,statusCode:201, data:{chat:newGroup}})
    }

    getGroup = async (req:Request , res:Response):Promise<Response> => {
        const {groupId} = req.params as IGetGroupDtoParams
        const {page , size}:IGetChatDtoQuery = req.query
        const chat = await this.chatModel.findOneChat({filter:{
            _id:Types.ObjectId.createFromHexString(groupId),
            particpants:{$in:req.user?._id as Types.ObjectId},group:{$exists:true}
        },options:{
            populate:[{
                path:"messages.createdBy",select:"firstName lastName email gender profileImage"
            }]
        },page,size})
        if (!chat) {
            throw new BadRequest("Fail To Find Group")
        }
        return successResponse<IGetChatResponse>({res, data:{chat}})
    }
} 
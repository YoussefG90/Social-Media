import { Server } from "socket.io";
import { IAuthSocket } from "../gateway";
import {z} from "zod"
import { getChat ,createGroup, getGroup} from "./chat.validation";




export interface IMainDto {socket:IAuthSocket;callback?:any;io?:Server}
export type IGetChatDtoParams = z.infer<typeof getChat.params>
export type IGetChatDtoQuery = z.infer<typeof getChat.query>
export type IGetGroupDtoParams = z.infer<typeof getGroup.params>
export type ICreateChatGroupDto = z.infer<typeof createGroup.body>
export type ICreateChatGroupFileDto = z.infer<typeof createGroup.file>
export interface ISayHiDto extends IMainDto {message:string}
export interface ISendMessageDto extends IMainDto {content:string;sendTo:string}
export interface ISendGroupMessageDto extends IMainDto {content:string;groupId:string}
export interface IJoinRoomDto extends IMainDto {roomId:string}
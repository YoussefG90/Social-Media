"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const success_response_1 = require("../../utils/Response/success.response");
const repository_1 = require("../../DB/repository");
const models_1 = require("../../DB/models");
const mongoose_1 = require("mongoose");
const error_response_1 = require("../../utils/Response/error.response");
const gateway_1 = require("../gateway");
const cloudinary_1 = require("../../utils/Multer/cloudinary");
const uuid_1 = require("uuid");
class ChatService {
    chatModel = new repository_1.ChatRepository(models_1.ChatModel);
    userModel = new repository_1.UserReposirotry(models_1.UserModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const { page, size } = req.query;
        const chat = await this.chatModel.findOneChat({ filter: {
                particpants: { $all: [
                        req.user?._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId)
                    ] }, group: { $exists: false }
            }, options: {
                populate: [{
                        path: "particpants", select: "firstName lastName email gender profileImage"
                    }]
            }, page, size });
        if (!chat) {
            throw new error_response_1.BadRequest("Fail To Find Chat");
        }
        return (0, success_response_1.successResponse)({ res, data: { chat } });
    };
    sayHi = ({ message, socket, callback, io }) => {
        try {
            console.log({ message });
            callback ? callback("Hello FE") : undefined;
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendMessage = async ({ content, sendTo, socket, io }) => {
        try {
            const createdBy = socket.credentials?.user._id;
            const user = await this.userModel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: createdBy }
                }
            });
            if (!user) {
                throw new error_response_1.NotFound("Invalid Recipient Friend");
            }
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    particpants: { $all: [
                            createdBy,
                            mongoose_1.Types.ObjectId.createFromHexString(sendTo)
                        ] }, group: { $exists: false }
                },
                update: {
                    $addToSet: { messages: { content, createdBy } }
                }
            });
            if (!chat) {
                const [newChat] = (await this.chatModel.create({
                    data: [{
                            createdBy, messages: [{ content, createdBy }],
                            particpants: [
                                createdBy,
                                mongoose_1.Types.ObjectId.createFromHexString(sendTo)
                            ]
                        }]
                })) || [];
                if (!newChat) {
                    throw new error_response_1.BadRequest("Fail To Create Chat");
                }
            }
            io?.to(gateway_1.connectedSockets.get(createdBy.toString())).emit("successMessage", { content });
            io?.to(gateway_1.connectedSockets.get(sendTo)).emit("newMessage", { content, from: socket.credentials?.user });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendGroupMessage = async ({ content, groupId, socket, io }) => {
        try {
            const createdBy = socket.credentials?.user._id;
            const chat = await this.chatModel.findOneAndUpdate({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                    particpants: { $in: createdBy },
                    group: { $exists: true }
                },
                update: {
                    $addToSet: { messages: { content, createdBy } }
                }
            });
            if (!chat) {
                throw new error_response_1.BadRequest("Fail To Find Group");
            }
            io?.to(gateway_1.connectedSockets.get(createdBy.toString())).emit("successMessage", { content });
            socket?.to(chat.roomId).emit("newMessage", { content, from: socket.credentials?.user, groupId });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this.chatModel.findOne({
                filter: { roomId, group: { $exists: true },
                    particpants: { $in: socket.credentials?.user._id } }
            });
            if (!chat) {
                throw new error_response_1.BadRequest("Fail To Join Room");
            }
            socket.join(chat.roomId);
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    createGroup = async (req, res) => {
        const { group, participants } = req.body;
        const dbParticipants = participants.map((participants) => {
            return mongoose_1.Types.ObjectId.createFromHexString(participants);
        });
        const users = await this.userModel.find({
            filter: {
                _id: { $in: dbParticipants },
                friends: { $in: req.user?._id }
            }
        });
        if (participants.length != users.length) {
            throw new error_response_1.NotFound("Some Or All Users Invalid");
        }
        const roomId = group.replaceAll(/\s+/g, "_") + "_" + (0, uuid_1.v4)();
        const { secure_url, public_id } = await (0, cloudinary_1.uploadFile)({
            file: req.file,
            path: `Chat/${roomId}`,
        });
        dbParticipants.push(req.user?._id);
        const [newGroup] = await this.chatModel.create({
            data: [{ createdBy: req.user?._id, group, roomId,
                    group_image: { secure_url, public_id },
                    messages: [], particpants: dbParticipants }],
        }) || [];
        if (!newGroup) {
            if (public_id) {
                await (0, cloudinary_1.destroyFile)({ public_id });
            }
            throw new error_response_1.BadRequest("Fail To Create Group");
        }
        return (0, success_response_1.successResponse)({ res, statusCode: 201, data: { chat: newGroup } });
    };
    getGroup = async (req, res) => {
        const { groupId } = req.params;
        const { page, size } = req.query;
        const chat = await this.chatModel.findOneChat({ filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                particpants: { $in: req.user?._id }, group: { $exists: true }
            }, options: {
                populate: [{
                        path: "messages.createdBy", select: "firstName lastName email gender profileImage"
                    }]
            }, page, size });
        if (!chat) {
            throw new error_response_1.BadRequest("Fail To Find Group");
        }
        return (0, success_response_1.successResponse)({ res, data: { chat } });
    };
}
exports.ChatService = ChatService;

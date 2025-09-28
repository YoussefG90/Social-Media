"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initializeIo = exports.connectedSockets = void 0;
const socket_io_1 = require("socket.io");
const Token_1 = require("../../utils/Security/Token");
const chat_1 = require("../chat");
const error_response_1 = require("../../utils/Response/error.response");
exports.connectedSockets = new Map();
let io = undefined;
const initializeIo = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: { origin: '*' },
    });
    io.use(async (socket, next) => {
        try {
            const { user, decoded } = await (0, Token_1.decodedToken)({
                authorization: socket.handshake?.auth.authentication || '',
                tokenType: Token_1.TokenEnum.access,
            });
            const userId = user._id.toString();
            const existingSockets = exports.connectedSockets.get(userId) || [];
            exports.connectedSockets.set(userId, [...existingSockets, socket.id]);
            socket.credentials = { user, decoded };
            if (existingSockets.length === 0) {
                (0, exports.getIo)().emit('online_user', userId);
            }
            next();
        }
        catch (error) {
            next(error instanceof Error ? error : new Error(String(error)));
        }
    });
    function disconnection(socket) {
        socket.on('disconnect', () => {
            const userId = socket.credentials?.user._id?.toString();
            const existingSockets = exports.connectedSockets.get(userId) || [];
            const updatedSockets = existingSockets.filter((id) => id !== socket.id);
            if (updatedSockets.length > 0) {
                exports.connectedSockets.set(userId, updatedSockets);
            }
            else {
                exports.connectedSockets.delete(userId);
                (0, exports.getIo)().emit('offline_user', userId);
            }
        });
    }
    function typing(socket) {
        socket.on('start_typing', (data) => {
            const fromUserId = socket.credentials?.user?._id?.toString();
            if (!fromUserId)
                return;
            const targetSockets = exports.connectedSockets.get(data.toUserId) || [];
            (0, exports.getIo)().to(targetSockets).emit('user_typing', {
                fromUserId,
                typing: true,
            });
        });
        socket.on('stop_typing', (data) => {
            const fromUserId = socket.credentials?.user?._id?.toString();
            if (!fromUserId)
                return;
            const targetSockets = exports.connectedSockets.get(data.toUserId) || [];
            (0, exports.getIo)().to(targetSockets).emit('user_typing', {
                fromUserId,
                typing: false,
            });
        });
    }
    const chatGateway = new chat_1.ChatGateway();
    io.on('connection', (socket) => {
        chatGateway.register(socket, (0, exports.getIo)());
        disconnection(socket);
        typing(socket);
    });
};
exports.initializeIo = initializeIo;
const getIo = () => {
    if (!io) {
        throw new error_response_1.BadRequest('Fail To establish Server Socket.io');
    }
    return io;
};
exports.getIo = getIo;

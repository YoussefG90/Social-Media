import { Server } from 'socket.io';
import { decodedToken, TokenEnum } from '../../utils/Security/Token';
import { Server as HttpServer } from 'http';
import { IAuthSocket } from './gateway.interface';
import { ChatGateway } from '../chat';
import { BadRequest } from '../../utils/Response/error.response';

export const connectedSockets = new Map<string, string[]>();

let io: Server | undefined = undefined;

export const initializeIo = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  io.use(async (socket: IAuthSocket, next) => {
    try {
      const { user, decoded } = await decodedToken({
        authorization: socket.handshake?.auth.authentication || '',
        tokenType: TokenEnum.access,
      });

      const userId = user._id.toString();
      const existingSockets = connectedSockets.get(userId) || [];

      connectedSockets.set(userId, [...existingSockets, socket.id]);
      socket.credentials = { user, decoded };

      if (existingSockets.length === 0) {
        getIo().emit('online_user', userId);
      }

      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });

  function disconnection(socket: IAuthSocket) {
    socket.on('disconnect', () => {
      const userId = socket.credentials?.user._id?.toString() as string;

      const existingSockets = connectedSockets.get(userId) || [];
      const updatedSockets = existingSockets.filter((id) => id !== socket.id);

      if (updatedSockets.length > 0) {
        connectedSockets.set(userId, updatedSockets);
      } else {
        connectedSockets.delete(userId);
        getIo().emit('offline_user', userId);
      }
    });
  }

  function typing(socket: IAuthSocket) {
  socket.on('start_typing', (data: { toUserId: string }) => {
    const fromUserId = socket.credentials?.user?._id?.toString();
    if (!fromUserId) return; 

    const targetSockets = connectedSockets.get(data.toUserId) || [];
    getIo().to(targetSockets).emit('user_typing', {
      fromUserId,
      typing: true,
    });
  });

  socket.on('stop_typing', (data: { toUserId: string }) => {
    const fromUserId = socket.credentials?.user?._id?.toString();
    if (!fromUserId) return;

    const targetSockets = connectedSockets.get(data.toUserId) || [];
    getIo().to(targetSockets).emit('user_typing', {
      fromUserId,
      typing: false,
    });
  });
}


  const chatGateway: ChatGateway = new ChatGateway();

  io.on('connection', (socket: IAuthSocket) => {
    chatGateway.register(socket, getIo());
    disconnection(socket);
    typing(socket); 
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new BadRequest('Fail To establish Server Socket.io');
  }
  return io;
};

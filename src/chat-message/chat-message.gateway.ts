import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: any, data: { userId: string }) {
    client.join(data.userId);
  }

  sendNotificationToUser(userId: string, message: string) {
    this.server.to(userId).emit('notification', message);
  }
}

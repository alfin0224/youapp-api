import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './chat-message.model';
import { SendMessageDto } from './chat-message.dto';
import { Channel, connect, Connection } from 'amqplib';
import { MessageGateway } from './chat-message.gateway'; 

@Injectable()
export class ChatMessageService {
  private rabbitMQConnection: Connection;
  private rabbitMQChannel: Channel;
  private readonly exchangeName = 'chat-exchange';

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly messageGateway: MessageGateway, 
  ) {
    this.setupRabbitMQ();
  }

  async sendMessageToRabbitMQ(senderId: string, receiverId: string, content: string) {
    const messageContent = new SendMessageDto();
    messageContent.senderId = senderId;
    messageContent.receiverId = receiverId;
    messageContent.content = content;
    
    const newMessage = await this.messageModel.create({
      senderId: messageContent.senderId,
      receiverId: messageContent.receiverId,
      content: messageContent.content,
    });

    this.rabbitMQChannel.publish(this.exchangeName, '', Buffer.from(JSON.stringify(newMessage))); 
    this.messageGateway.sendNotificationToUser(receiverId, 'Anda memiliki pesan baru.');
  }

  async setupMessageConsumer(userId: string, callback: (message: any) => void) {
    const queueName = `user-${userId}-queue`;

    await this.rabbitMQChannel.assertExchange(this.exchangeName, 'direct', { durable: true });
    await this.rabbitMQChannel.assertQueue(queueName, { durable: true });
    await this.rabbitMQChannel.bindQueue(queueName, this.exchangeName, '');

    this.rabbitMQChannel.consume(queueName, (msg) => {
      if (msg) {
        const message = JSON.parse(msg.content.toString());
        callback(message);
        this.rabbitMQChannel.ack(msg);
      }
    });
  }

  async receiveMessage(receiverId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ receiverId }).exec();
  }

  private async setupRabbitMQ() {
    this.rabbitMQConnection = await connect('amqp://guest:guest@127.0.0.1:5672');
    this.rabbitMQChannel = await this.rabbitMQConnection.createChannel();
    await this.rabbitMQChannel.assertExchange(this.exchangeName, 'direct', { durable: true });
  }
}

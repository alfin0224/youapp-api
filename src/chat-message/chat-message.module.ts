import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './chat-message.model';
import { MessageController } from './chat-message.controller';
import { ChatMessageService } from './chat-message.service';
import { MessageGateway } from './chat-message.gateway'; 

@Module({
  imports: [MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  controllers: [MessageController],
  providers: [ChatMessageService, MessageGateway],
})
export class MessageModule {}

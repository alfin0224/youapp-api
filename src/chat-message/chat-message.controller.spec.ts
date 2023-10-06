import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './chat-message.controller';
import { ChatMessageService } from './chat-message.service';
import { ForbiddenException } from '@nestjs/common';

describe('MessageController', () => {
  let messageController: MessageController;
  let chatMessageService: ChatMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: ChatMessageService,
          useValue: {
            sendMessageToRabbitMQ: jest.fn(),
            setupMessageConsumer: jest.fn(),
            receiveMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    messageController = module.get<MessageController>(MessageController);
    chatMessageService = module.get<ChatMessageService>(ChatMessageService);
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const senderId = 'senderId';
      const receiverId = 'receiverId';
      const content = 'Hello, world!';

      const req = {
        user: {
          userId: senderId,
        },
      };

      const result = await messageController.sendMessage(req, senderId, receiverId, { content });

      expect(result).toEqual({
        message: 'Pesan berhasil dikirim',
      });

      expect(chatMessageService.sendMessageToRabbitMQ).toHaveBeenCalledWith(senderId, receiverId, content);
    });

    it('should throw ForbiddenException when senderId does not match user ID', async () => {
      const senderId = 'senderId';
      const receiverId = 'receiverId';
      const content = 'Hello, world!';

      const req = {
        user: {
          userId: 'invalidUserId',
        },
      };

      await expect(messageController.sendMessage(req, senderId, receiverId, { content })).rejects.toThrowError(
        ForbiddenException,
      );
    });
  });

  describe('getMessages', () => {
    it('should set up message consumer successfully', async () => {
      const userId = 'userId';
      const req = {
        user: {
          userId,
        },
      };

      const result = await messageController.getMessages(req, userId);

      expect(result).toEqual({ message: 'Menerima pesan...' });
      expect(chatMessageService.setupMessageConsumer).toHaveBeenCalledWith(userId, expect.any(Function));
    });

    it('should throw ForbiddenException when userId does not match user ID', async () => {
      const userId = 'userId';
      const req = {
        user: {
          userId: 'invalidUserId',
        },
      };

      await expect(messageController.getMessages(req, userId)).rejects.toThrowError(ForbiddenException);
    });
  });

  describe('receiveMessage', () => {
    it('should receive messages successfully', async () => {
      const receiverId = 'receiverId';
      const req = {
        user: {
          userId: receiverId,
        },
      };

      const mockMessages = [{ content: 'Hello' }, { content: 'World' }];
      chatMessageService.receiveMessage = jest.fn().mockResolvedValue(mockMessages);

      const result = await messageController.receiveMessage(req, receiverId);

      expect(result).toEqual(mockMessages);
      expect(chatMessageService.receiveMessage).toHaveBeenCalledWith(receiverId);
    });

    it('should throw ForbiddenException when receiverId does not match user ID', async () => {
      const receiverId = 'receiverId';
      const req = {
        user: {
          userId: 'invalidUserId',
        },
      };

      await expect(messageController.receiveMessage(req, receiverId)).rejects.toThrowError(ForbiddenException);
    });
  });
});

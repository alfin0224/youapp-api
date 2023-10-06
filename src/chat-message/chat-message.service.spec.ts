import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ChatMessageService } from './chat-message.service';
import { Message, MessageDocument } from './chat-message.model';
import { SendMessageDto } from './chat-message.dto';
import { MessageGateway } from './chat-message.gateway';
import { Connection, Channel} from 'amqplib-mocks';

const mockAmqplib = {
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn(),
  }),
};

describe('ChatMessageService', () => {
  let chatMessageService: ChatMessageService;
  let messageModel: Model<MessageDocument>;
  let messageGateway: MessageGateway;
  let mockRabbitMQChannel: any;

  const mockMessageModel = {
    create: jest.fn(),
    find: jest.fn(),
  } as any;

  const mockRabbitMQConnection: Connection = {
    createChannel: jest.fn(),
  } as unknown as Connection;

  beforeEach(async () => {
    mockRabbitMQChannel = {
      publish: jest.fn(),
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
    } as unknown as Channel;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatMessageService,
        {
          provide: 'RabbitMQChannel',
          useValue: mockRabbitMQChannel,
        },
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
        {
          provide: MessageGateway,
          useValue: {
            sendNotificationToUser: jest.fn(),
          },
        },
        {
          provide: 'AMQP_CONNECTION',
          useValue: mockAmqplib, 
        },
      ],
    }).compile();

    chatMessageService = module.get<ChatMessageService>(ChatMessageService);
    messageModel = module.get<Model<MessageDocument>>(
      getModelToken(Message.name),
    );
    messageGateway = module.get<MessageGateway>(MessageGateway);
    chatMessageService['rabbitMQChannel'] = mockRabbitMQChannel;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessageToRabbitMQ', () => {
    it('should send a message to RabbitMQ and save it to the database', async () => {
      const senderId = 'sender123';
      const receiverId = 'receiver456';
      const content = 'Hello, World!';

      const messageContent = new SendMessageDto();
      messageContent.senderId = senderId;
      messageContent.receiverId = receiverId;
      messageContent.content = content;

      const newMessage = {
        senderId: messageContent.senderId,
        receiverId: messageContent.receiverId,
        content: messageContent.content,
      };
      (mockMessageModel.create as jest.Mock).mockResolvedValue(newMessage);

      await chatMessageService.sendMessageToRabbitMQ(
        senderId,
        receiverId,
        content,
      );

      expect(mockMessageModel.create).toHaveBeenCalledWith({
        senderId,
        receiverId,
        content,
      });

      expect(mockRabbitMQChannel.publish).toHaveBeenCalledWith(
        chatMessageService['exchangeName'],
        '',
        expect.any(Buffer),
      );

      expect(messageGateway.sendNotificationToUser).toHaveBeenCalledWith(
        receiverId,
        'Anda memiliki pesan baru.',
      );
    });
  });

  describe('setupMessageConsumer', () => {
    it('should set up RabbitMQ message consumer for a user', async () => {
      const userId = 'testUserId';
      const callback = jest.fn();

      const mockAssertExchange = jest.fn();
      const mockAssertQueue = jest.fn();
      const mockBindQueue = jest.fn();

      (mockRabbitMQChannel.assertExchange as jest.Mock).mockResolvedValue(
        mockAssertExchange,
      );
      (mockRabbitMQChannel.assertQueue as jest.Mock).mockResolvedValue(
        mockAssertQueue,
      );
      (mockRabbitMQChannel.bindQueue as jest.Mock).mockResolvedValue(
        mockBindQueue,
      );
      (mockRabbitMQChannel.consume as jest.Mock).mockImplementation(
        (queueName, callback) => {
          callback({
            content: Buffer.from(JSON.stringify({ message: 'Test message' })),
          } as any);
        },
      );

      (mockRabbitMQConnection.createChannel as jest.Mock).mockResolvedValue(
        mockRabbitMQChannel,
      );
      (mockMessageModel.create as jest.Mock).mockResolvedValue({});
      (messageGateway.sendNotificationToUser as jest.Mock).mockReturnValue(
        undefined,
      );

      await chatMessageService.setupMessageConsumer(userId, callback);

      expect(mockRabbitMQChannel.assertExchange).toHaveBeenCalledWith(
        'chat-exchange',
        'direct',
        { durable: true },
      );
      expect(mockRabbitMQChannel.assertQueue).toHaveBeenCalledWith(
        `user-${userId}-queue`,
        { durable: true },
      );
      expect(mockRabbitMQChannel.bindQueue).toHaveBeenCalledWith(
        `user-${userId}-queue`,
        'chat-exchange',
        '',
      );
      expect(mockRabbitMQChannel.consume).toHaveBeenCalledWith(
        `user-${userId}-queue`,
        expect.any(Function),
      );

      expect(callback).toHaveBeenCalledWith({ message: 'Test message' });
      expect(mockRabbitMQChannel.ack).toHaveBeenCalledWith(expect.anything());
    });
  });

});

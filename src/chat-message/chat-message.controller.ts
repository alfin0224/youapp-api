import { Controller, Post, Get, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ChatMessageService } from './chat-message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('messages')
@Controller('api/messages')
export class MessageController {
  constructor(private readonly chatMessageService: ChatMessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':senderId/:receiverId')
  @ApiOperation({ summary: 'Send a message' })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'The message has been sent successfully.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async sendMessage(
    @Request() req,
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
    @Body() body: { content: string },
  ) {
    if (senderId !== req.user.userId) {
      throw new ForbiddenException('Access denied: You can only send a message using your own account!');
    }
    const message = {
      senderId,
      receiverId,
      content: body.content,
    };

    try {
      await this.chatMessageService.sendMessageToRabbitMQ(
        message.senderId,
        message.receiverId,
        message.content,
      );
      return { message: 'Pesan berhasil dikirim' };
    } catch (error) {
      return { error: 'Gagal mengirim pesan' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiOperation({ summary: 'Get messages' })
  @ApiBearerAuth()
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async getMessages(@Request() req, @Param('userId') userId: string) {
    if (userId !== req.user.userId) {
      throw new ForbiddenException('Access denied: You can only read your messages!');
    }
    
    await this.chatMessageService.setupMessageConsumer(userId, (message) => {
      console.log(`Pesan diterima oleh ${userId}: ${message.content}`);
    });

    return { message: 'Menerima pesan...' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('inbox/:receiverId')
  @ApiOperation({ summary: 'Get inbox messages' })
  @ApiBearerAuth()
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async receiveMessage(
    @Request() req,
    @Param('receiverId') receiverId: string,
  ) {
    if (receiverId !== req.user.userId) {
      throw new ForbiddenException('Access denied: You can only read your inbox messages!');
    }
    try {
      return this.chatMessageService.receiveMessage(receiverId);
    } catch (error) {
      return { error: error.message };
    }
  }
}




import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @IsNotEmpty({ message: 'SenderId is required' })
  @IsString({ message: 'SenderId must be a string' })
  @ApiProperty({ description: 'The sender ID', example: 'sender123' }) 
  senderId: string;

  @IsNotEmpty({ message: 'ReceiverId is required' })
  @IsString({ message: 'ReceiverId must be a string' })
  @ApiProperty({ description: 'The receiver ID', example: 'receiver456' })
  receiverId: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @ApiProperty({ description: 'The content of the message', example: 'Hello, how are you?' })
  content: string;
}

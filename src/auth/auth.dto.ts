import {
  IsNotEmpty,
  IsEmail,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; 

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Username', example: 'myusername' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User password', example: 'mypassword' })
  password: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Username or email', example: 'myusername' })
  usernameOrEmail: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User password', example: 'mypassword' })
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'User ID', example: 'user123' })
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Username', example: 'myusername' })
  username: string;
}

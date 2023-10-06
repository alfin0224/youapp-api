import { IsNotEmpty, IsEmail, IsOptional, IsDateString, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  fullName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Gender', example: 'Male' })
  gender: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Birthday', example: '1990-01-01' })
  birthday: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Zodiac sign', example: 'Leo' })
  zodiac: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Height in inches', example: 70 })
  heightInches: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Height in centimeters', example: 178 })
  heightCentimeters: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Weight in KG', example: 70 })
  weightKG: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  fullName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Gender', example: 'Male' })
  gender: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'Birthday', example: '1990-01-01' })
  birthday: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Zodiac sign', example: 'Leo' })
  zodiac: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Height in inches', example: 70 })
  heightInches: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Height in centimeters', example: 178 })
  heightCentimeters: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Weight in KG', example: 70 })
  weightKG: number;
}

export class AddInterestDto {
  @IsNotEmpty()
  @IsString({ each: true })
  @ApiProperty({ description: 'List of interests', example: ['Hiking', 'Swimming'] })
  interests: string[];
}

export class RemoveInterestDto {
  @IsNotEmpty()
  @IsString({ each: true })
  @ApiProperty({ description: 'List of interests to remove', example: ['Swimming'] })
  interests: string[];
}

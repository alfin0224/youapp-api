import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './user.model';
import { AuthService } from 'src/auth/auth.service';
import { RefreshToken, RefreshTokenSchema } from '../refresh-jwt-auth/refresh-jwt.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name , schema: UserSchema }]),
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService],
  exports: [UserService],
})
export class UserModule {}

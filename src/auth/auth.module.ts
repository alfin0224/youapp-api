import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshJwtStrategy } from '../refresh-jwt-auth/refresh-jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RefreshToken, RefreshTokenSchema } from '../refresh-jwt-auth/refresh-jwt.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      controllers: [AuthController],
      providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
      exports: [AuthService],
})
export class AuthModule{}

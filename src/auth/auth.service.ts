import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto, LoginDto } from './auth.dto';
import { User, UserDocument } from '../user/user.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { escape } from 'he';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../refresh-jwt-auth/refresh-jwt.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async register(registerDto: RegisterDto): Promise<UserDocument> {
    const email = escape(registerDto.email);
    const username = escape(registerDto.username);
    const password = escape(registerDto.password);

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('Email atau username sudah terdaftar');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const savedUser = await this.userModel.create({
      email: email,
      username: username,
      password: hashedPassword,

    });

    return savedUser;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const usernameOrEmail = escape(loginDto.usernameOrEmail);
    const password = loginDto.password;

    const user = await this.userModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Password salah');
    }

    const accessToken = jwt.sign(
      { sub: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: '300s',
      },
    );

    const refreshToken = jwt.sign(
      { sub: user._id, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '7d',
      },
    );
    await this.saveRefreshToken(user._id, accessToken, refreshToken);

    return { accessToken: accessToken, refreshToken };
  }

  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async refreshToken(
    userId: string,
    username: string,
  ): Promise<{ accessToken: string }> {
    const payload = { sub: userId, username: username };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '600s',
    });

    return { accessToken: newAccessToken };
  }

  async saveRefreshToken(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const newRefreshToken = new this.refreshTokenModel({
        userId,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      await newRefreshToken.save();
    } catch (error) {
      throw new Error('Gagal menyimpan refresh token');
    }
  }

  async logout(userId: string) {
    const userToken = await this.refreshTokenModel.findOne({
      userId,
    });

    if (!userToken) {
      throw new NotFoundException('Token not found');
    }

    await this.refreshTokenModel.findByIdAndRemove(userToken._id);
    const shortLivedToken = jwt.sign(
      { sub: userId},
      process.env.JWT_SECRET,
      {
        expiresIn: '3s',
      },
    );

    return shortLivedToken;
  }
}

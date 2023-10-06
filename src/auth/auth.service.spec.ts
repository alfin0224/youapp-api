import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.model';
import { RegisterDto, LoginDto } from './auth.dto';
import { RefreshToken } from '../refresh-jwt-auth/refresh-jwt.model';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwt = {
  sign: jest.fn(),
};

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockRefreshTokenModel = {
    findOne: jest.fn(),
    findByIdAndRemove: jest.fn(),
    save: jest.fn(),
  };
  jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenModel,
        },
        {
          provide: 'BcryptService',
          useValue: mockBcrypt,
        },
        {
          provide: 'JwtService',
          useValue: mockJwt,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'user@example.com',
        username: 'user123',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      mockUserModel.findOne.mockReturnValue(null);

      const newUser = new User();
      newUser.email = 'user@example.com';
      newUser.username = 'user123';
      newUser.password = hashedPassword;
  
      const savedUser = ({
        email: newUser.email,
        username: newUser.username,
        password: newUser.password,
  
      });

      (mockUserModel.create as jest.Mock).mockResolvedValue(savedUser);

      await authService.register(registerDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [{ email: registerDto.email }, { username: registerDto.username }],
      });
      expect(mockUserModel.create as jest.Mock).toHaveBeenCalledWith({
        email: registerDto.email,
        username: registerDto.username,
        password: hashedPassword,
      });
    });

    it('should throw BadRequestException if email or username already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue({ email: 'test@example.com' });

      await expect(authService.register(registerDto)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'user@example.com',
        password: 'password123',
      };

      const user: UserDocument = {
        _id: '1',
        email: 'user@example.com',
        username: 'user123',
        password: 'hashedPassword',
      } as UserDocument;

      mockUserModel.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const accessToken = 'access_token';
      const refreshToken = 'refresh_token';

      (jwt.sign as jest.Mock).mockReturnValueOnce(accessToken);
      (jwt.sign as jest.Mock).mockReturnValueOnce(refreshToken);

      authService.saveRefreshToken = jest.fn();

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        accessToken,
        refreshToken,
      });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [
          { username: loginDto.usernameOrEmail },
          { email: loginDto.usernameOrEmail },
        ],
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: user._id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: '300s',
        },
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: user._id, username: user.username },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: '7d',
        },
      );

      expect(authService.saveRefreshToken).toHaveBeenCalledWith(
        user._id,
        accessToken,
        refreshToken,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      const loginDto = {
        usernameOrEmail: 'testuser',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke a user token and return a short-lived token', async () => {
      const userId = 'user123';
      const userToken = {
        _id: 'token123',
      };

      mockRefreshTokenModel.findOne.mockResolvedValue(userToken);

      (jwt.sign as jest.Mock).mockReturnValue('jwt_token');
      const result = await authService.logout(userId);

      expect(mockRefreshTokenModel.findByIdAndRemove).toHaveBeenCalledWith(
        'token123',
      );

      expect(jwt.sign).toHaveBeenCalled();

      expect(result).toEqual('jwt_token');
    });

    it('should throw NotFoundException if token not found', async () => {
      const userId = 'user123';

      mockRefreshTokenModel.findOne.mockResolvedValue(null);

      await expect(authService.logout(userId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});

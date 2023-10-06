import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RefreshJwtAuthGuard } from '../refresh-jwt-auth/refresh-jwt-auth.guard';
import { User, UserDocument } from '../user/user.model';
import { getModelToken } from '@nestjs/mongoose';
import { RefreshToken } from '../refresh-jwt-auth/refresh-jwt.model';

const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
};

const mockRefreshTokenModel = {
  findOne: jest.fn(),
  findByIdAndRemove: jest.fn(),
  save: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RefreshJwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password',
      };

      const registeredUser: UserDocument = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      } as UserDocument;

      jest.spyOn(authService, 'register').mockResolvedValue(registeredUser);

      const result = await authController.create(registerDto);
      expect(result).toBe(registeredUser);
    });
  });

  describe('login', () => {
    it('should log in and generate JWT token', async () => {
      const loginDto: LoginDto = {
        usernameOrEmail: 'testuser',
        password: 'password',
      };

      const authResult = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(authResult);

      const result = await authController.login(loginDto);
      expect(result).toBe(authResult);
    });
  });

  describe('refreshToken', () => {
    it('should refresh JWT token', async () => {
      const userId = 'mockUserId';
      const username = 'mockUsername';

      const authResult = {
        accessToken: 'mockAccessToken',
      };

      const req = { user: { userId, username } };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(authResult);

      const result = await authController.refreshToken(req);
      expect(result).toBe(authResult);
    });
  });

  describe('logout', () => {
    it('should log out and return a message', async () => {
      const userId = 'mockUserId';
      const accessToken = 'mockAccessToken';

      jest.spyOn(authService, 'logout').mockResolvedValue(accessToken);

      const req = { user: { userId } };

      const result = await authController.logout(req);
      expect(result).toEqual({ message: 'Logout berhasil', accessToken });
    });
  });
});

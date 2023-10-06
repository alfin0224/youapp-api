import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from './user.model';
import { UpdateUserDto } from './user.dto';

describe('UserService', () => {
  let userService: UserService;
  const mockUserModel = {
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
    save: jest.fn().mockReturnThis(),
    deleteOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findById', () => {
    it('should return the user with the given ID', async () => {
      const userId = '123456789';
      const mockUser: UserDocument = {
        _id: userId,
        email: 'user@example.com',
        username: 'user123',
        password: 'hashedPassword',
        fullName: 'John Doe',
        gender: 'Male',
        birthday: new Date('1990-01-01'),
        zodiac: 'Capricornus',
        heightInches: 70,
        heightCentimeters: 178,
        weightKG: 75,
        interests: ['Sports', 'Music'],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
      } as UserDocument;

      mockUserModel.exec.mockResolvedValue(mockUser);

      const result = await userService.findById(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user with the given ID is not found', async () => {
      const userId = '999999999';

      mockUserModel.exec.mockResolvedValue(null);

      await expect(userService.findById(userId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user profile correctly', async () => {
      const userId = '123456789';
      const updateUserDto: UpdateUserDto = {
        fullName: 'John Doe Update',
        heightCentimeters: 178,
        birthday: new Date('1990-01-01'),
      } as UpdateUserDto;

      const mockUser = {
        _id: userId,
        fullName: 'John Doe',
        heightInches: 0,
        birthday: new Date('1990-01-01'),
        save: jest.fn(),
      };

      mockUserModel.exec.mockResolvedValue(mockUser);

      const updatedUser = await userService.updateUser(userId, updateUserDto);

      expect(updatedUser.fullName).toBe('John Doe Update');
      expect(updatedUser.heightInches).toBeCloseTo(70.0787, 2);
    });

    it('should throw NotFoundException if user with the given ID is not found', async () => {
      const userId = '999999999';
      const updateUserDto: UpdateUserDto = {
        fullName: 'John Doe Update',
      } as UpdateUserDto;

      mockUserModel.exec.mockResolvedValue(null);

      await expect(
        userService.updateUser(userId, updateUserDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return the deleted user', async () => {
      const userId = '123456789';
      const mockUser = {
        _id: userId,
        email: 'user@example.com',
        username: 'user123',
        password: 'hashedPassword',
        fullName: 'John Doe',
        gender: 'Male',
        birthday: new Date('1990-01-01'),
        zodiac: 'Capricornus',
        heightInches: 70,
        heightCentimeters: 178,
        weightKG: 75,
        interests: ['Sports', 'Music'],
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-02T00:00:00Z'),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      };

      mockUserModel.exec.mockResolvedValue(mockUser);

      const deletedUser = await userService.deleteUser(userId);

      expect(deletedUser).toEqual({ deletedCount: 1 });
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(mockUser.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '999';
      mockUserModel.exec.mockResolvedValue(null);

      await expect(userService.deleteUser(userId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

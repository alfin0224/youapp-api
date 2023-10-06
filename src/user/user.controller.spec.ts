import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User, UserDocument } from './user.model';

class UserModel {
  static findOne: jest.Mock;
  static findById: jest.Mock;
  save: jest.Mock;
}

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    UserModel.findOne = jest.fn();
    UserModel.findById = jest.fn();
    UserModel.prototype.save = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: UserModel,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const mockUser: UserDocument = {
        _id: '1',
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

      const mockRequest = {
        user: {
          userId: '1',
        },
      };

      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser);

      const result = await userController.findById(mockRequest, '1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(undefined);

      const mockRequest = {
        user: {
          userId: '1',
        },
      };

      await expect(userController.findById(mockRequest, '999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user profile', async () => {
      const userUpdate: UserDocument = {
        _id: '1',
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

      const mockRequest = {
        user: {
          userId: '1',
        },
      };

      const updateUserDto: UpdateUserDto = {
        fullName: 'John Doe Update',
        gender: 'Male',
        birthday: new Date('1990-01-01'),
        zodiac: 'Capricornus',
        heightInches: 70,
        heightCentimeters: 178,
        weightKG: 75,
      };

      jest.spyOn(userService, 'updateUser').mockResolvedValue(userUpdate);

      const result = await userController.update(mockRequest, '1', updateUserDto);
      expect(result).toEqual({ "message": "User updated successfully", userUpdate });
    });

    it('should throw ForbiddenException when trying to edit another user', async () => {
      const updateUserDto = {
        fullName: 'John Doe Update',
        gender: 'Male',
        birthday: new Date('1990-01-01'),
        zodiac: 'Capricornus',
        heightInches: 70,
        heightCentimeters: 178,
        weightKG: 75,
      }

      const mockRequest = {
        user: {
          userId: '97',
        },
      };
      jest.spyOn(userService, 'updateUser').mockResolvedValue(undefined);


      await expect(userController.update(mockRequest, '999', updateUserDto)).rejects.toThrowError(ForbiddenException);
    });
  });

  it('should delete the user', async () => {
    const userId = '1';
    const mockRequest = {
      user: {
        userId,
      },
    };
  
    const deletedUser: UserDocument = {
        _id: '1',
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
  
    jest.spyOn(userService, 'deleteUser').mockResolvedValue(deletedUser);
  
    const result = await userController.delete(mockRequest, userId);
  
    expect(result).toEqual({
      message: 'User deleted successfully',
      userDeleted: {
        _id: '1',
        birthday: new Date('1990-01-01T00:00:00.000Z'),
        createdAt: new Date('2023-01-01T00:00:00.000Z'),
        email: 'user@example.com',
        fullName: 'John Doe',
        gender: 'Male',
        heightCentimeters: 178,
        heightInches: 70,
        interests: ['Sports', 'Music'],
        password: 'hashedPassword',
        updatedAt: new Date('2023-01-02T00:00:00.000Z'),
        username: 'user123',
        weightKG: 75,
        zodiac: 'Capricornus',
      },
    });
  });
  
  
  it('should throw ForbiddenException when trying to delete another user', async () => {
    const userId = '2';
    const mockRequest = {
      user: {
        userId: '1', 
      },
    };
  
    await expect(userController.delete(mockRequest, userId)).rejects.toThrowError(ForbiddenException);
  });

  it('should add interests to the user', async () => {
    const userId = '1';
    const mockRequest = {
      user: {
        userId,
      },
    };
  
    const addInterestDto = {
      interests: ['Hiking', 'Cooking'],
    };
  
    const updatedUser: UserDocument = {
        interests: ['Hiking', 'Cooking'],
    } as UserDocument;
  
    jest.spyOn(userService, 'addInterest').mockResolvedValue(updatedUser);
  
    const result = await userController.addInterest(mockRequest, userId, addInterestDto);
  
    expect(result).toEqual({
      addUserInterest: {
        interests: addInterestDto.interests,
      },
      message: 'Add user interest successfully',
    });

  });
  
  it('should throw ForbiddenException when trying to add interests for another user', async () => {
    const userId = '2'; 
    const mockRequest = {
      user: {
        userId: '1',
      },
    };
  
    const addInterestDto = {
      interests: ['Hiking', 'Cooking'],
    };
  
    await expect(userController.addInterest(mockRequest, userId, addInterestDto)).rejects.toThrowError(ForbiddenException);
  });
  

  afterAll(async () => {
    jest.clearAllMocks();
  });
});

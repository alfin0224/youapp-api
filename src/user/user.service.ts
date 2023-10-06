import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.model';
import {
  UpdateUserDto,
  AddInterestDto,
  RemoveInterestDto,
} from './user.dto';
import { escape } from 'he';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  calculateZodiac(birthday: Date): string {
    const date = birthday.getDate() || null;
    const month = birthday.getMonth() + 1;

    if ((month === 3 && date >= 21) || (month === 4 && date <= 19)) {
      return 'Aries';
    } else if ((month === 4 && date >= 20) || (month === 5 && date <= 20)) {
      return 'Taurus';
    } else if ((month === 5 && date >= 21) || (month === 6 && date <= 20)) {
      return 'Gemini';
    } else if ((month === 6 && date >= 21) || (month === 7 && date <= 22)) {
      return 'Cancer';
    } else if ((month === 7 && date >= 23) || (month === 8 && date <= 22)) {
      return 'Leo';
    } else if ((month === 8 && date >= 23) || (month === 9 && date <= 22)) {
      return 'Virgo';
    } else if ((month === 9 && date >= 23) || (month === 10 && date <= 23)) {
      return 'Libra';
    } else if ((month === 10 && date >= 24) || (month === 11 && date <= 21)) {
      return 'Scorpius';
    } else if ((month === 11 && date >= 22) || (month === 12 && date <= 21)) {
      return 'Sagittarius';
    } else if ((month === 12 && date >= 22) || (month === 1 && date <= 19)) {
      return 'Capricornus';
    } else if ((month === 1 && date >= 20) || (month === 2 && date <= 18)) {
      return 'Aquarius';
    } else {
      return 'Pisces';
    }
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  
  async findByUsernameOrEmail(
    usernameOrEmail: string,
  ): Promise<User | undefined> {
    return this.userModel
      .findOne()
      .or([{ email: usernameOrEmail }, { username: usernameOrEmail }])
      .exec();
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {

    const user = await this.findById(id);

    if (updateUserDto.fullName) {
      updateUserDto.fullName = escape(updateUserDto.fullName);
    }

    if (updateUserDto.heightCentimeters) {
      updateUserDto.heightInches = parseFloat((updateUserDto.heightCentimeters * 0.393701).toFixed(2));
    }
    
    Object.assign(user, updateUserDto);

    if (user && user.birthday) {
      user.zodiac = this.calculateZodiac(user.birthday);
    }

    await user.save();

    return user;
  }

  async deleteUser(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await user.deleteOne();
  }

  async deleteUsersByCriteria(criteria: any): Promise<void> {
    await this.userModel.deleteMany(criteria);
  }

  async addInterest(
    id: string,
    addInterestDto: AddInterestDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);
    user.interests.push(...addInterestDto.interests);
    return await user.save();
  }

  async removeInterest(
    id: string,
    removeInterestDto: RemoveInterestDto,
  ): Promise<UserDocument> {
    const user = await this.findById(id);
    user.interests = user.interests.filter(
      (interest) => !removeInterestDto.interests.includes(interest),
    );
    return await user.save();
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  fullName: string;

  @Prop()
  gender: string;

  @Prop()
  birthday: Date;

  @Prop()
  zodiac: string;

  @Prop()
  heightInches: number;

  @Prop()
  heightCentimeters: number;

  @Prop()
  weightKG: number;

  @Prop([String])
  interests: string[];  

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

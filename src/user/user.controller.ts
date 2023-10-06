import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto, AddInterestDto, RemoveInterestDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('getUser/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User found successfully.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findById(@Request() req, @Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (id !== req.user.userId) {
      throw new ForbiddenException(
        'Access denied: You can only see your own profile!',
      );
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Put('updateProfile/:id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
  })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (id !== req.user.userId) {
      throw new ForbiddenException(
        'Access denied: You can only edit your own profile!',
      );
    }
    const userUpdate = await this.userService.updateUser(id, updateUserDto);

    return { message: 'User updated successfully', userUpdate };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteUser/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async delete(@Request() req, @Param('id') id: string) {
    if (id !== req.user.userId) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own account!',
      );
    }
    const userDeleted = await this.userService.deleteUser(id);
    return { message: 'User deleted successfully', userDeleted };
  }

  @UseGuards(JwtAuthGuard)
  @Post('addInterest/:id')
  @ApiOperation({ summary: 'Add user interest' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User interest added successfully.',
  })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async addInterest(
    @Request() req,
    @Param('id') id: string,
    @Body() addInterestDto: AddInterestDto,
  ) {
    if (id !== req.user.userId) {
      throw new ForbiddenException(
        'Access denied: You can only add your own interest!!',
      );
    }

    const addUserInterest = await this.userService.addInterest(
      id,
      addInterestDto,
    );
    return { message: 'Add user interest successfully', addUserInterest };
  }

  @UseGuards(JwtAuthGuard)
  @Post('removeInterest/:id')
  @ApiOperation({ summary: 'Remove user interest' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User interest removed successfully.',
  })
  @ApiResponse({ status: 403, description: 'Access denied.' })
  async removeInterest(
    @Request() req,
    @Param('id') id: string,
    @Body() removeInterestDto: RemoveInterestDto,
  ) {
    if (id !== req.user.userId) {
      throw new ForbiddenException(
        'Access denied: You can only remove your own interest!',
      );
    }

    const removeUserInterest = await this.userService.removeInterest(
      id,
      removeInterestDto,
    );
    return { message: 'Remove user interest successfully', removeUserInterest };
  }
}

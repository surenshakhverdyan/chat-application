import { Body, Controller, Delete, Get, UseGuards } from '@nestjs/common';

import { AdminGuard } from 'src/guards';
import { AdminService } from './admin.service';
import { User } from 'src/users/schemas/user.schema';
import { Chat } from 'src/socket/schemas';
import { DeleteChatDto, DeleteUserDto } from './dto';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  getUsers(): Promise<User[]> {
    return this.adminService.getUsers();
  }

  @Get('conversations')
  getConversations(): Promise<Chat[]> {
    return this.adminService.getConversations();
  }

  @Delete('user')
  deleteUser(@Body() dto: DeleteUserDto): Promise<boolean> {
    return this.adminService.deleteUser(dto);
  }

  @Delete('conversation')
  deleteConversation(@Body() dto: DeleteChatDto): Promise<boolean> {
    return this.adminService.deleteConversation(dto);
  }
}

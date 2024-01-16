import { Controller, UseGuards } from '@nestjs/common';

import { AdminGuard } from 'src/guards';
import { AdminService } from './admin.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}
}

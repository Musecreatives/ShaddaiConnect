import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrialFeedbackService } from './trial-feedback.service';

@Controller('admin/trial-feedback')
@UseGuards(JwtAuthGuard)
export class AdminTrialFeedbackController {
  constructor(private readonly feedback: TrialFeedbackService) {}

  @Get()
  findAll() {
    return this.feedback.findAllForAdmin();
  }

  @Get('repeat-devices')
  repeatDevices() {
    return this.feedback.findRepeatTrialDevices();
  }
}

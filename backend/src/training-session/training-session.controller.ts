import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { RecordSetDto } from './dto/record-set.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { TrainingSessionService } from './training-session.service';

@Controller('training-sessions')
@UseGuards(JwtAuthGuard)
export class TrainingSessionController {
  constructor(private readonly trainingSessionService: TrainingSessionService) {}

  @Post()
  async createSession(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateTrainingSessionDto,
  ) {
    return this.trainingSessionService.createTrainingSession(userId, createDto.date);
  }

  @Post(':sessionId/records')
  async addRecord(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() recordDto: RecordSetDto,
  ) {
    const { session, repRangeAlert, plateauAlert } = await this.trainingSessionService.addRecordToSession(
      userId,
      sessionId,
      recordDto,
    );
    return { session, repRangeAlert, plateauAlert };
  }

  @Get('today')
  async getToday(@CurrentUser('id') userId: string) {
    return this.trainingSessionService.getTodaySession(userId);
  }

  @Get(':sessionId')
  async getSession(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    return this.trainingSessionService.getTrainingSession(userId, sessionId);
  }

  @Patch(':sessionId/records/:recordId')
  async updateRecord(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Param('recordId') recordId: string,
    @Body() recordDto: Partial<RecordSetDto>,
  ) {
    return this.trainingSessionService.updateSessionRecord(userId, sessionId, recordId, recordDto);
  }

  @Delete(':sessionId/records/:recordId')
  async deleteRecord(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.trainingSessionService.deleteSessionRecord(userId, sessionId, recordId);
  }

  @Patch(':sessionId/start')
  async startSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.trainingSessionService.startSession(userId, sessionId);
  }

  @Patch(':sessionId/pause')
  async pauseSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.trainingSessionService.pauseSession(userId, sessionId);
  }

  @Patch(':sessionId/complete')
  async completeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Body() updateDto: UpdateTrainingSessionDto,
  ) {
    const { session, repRangeAlerts } = await this.trainingSessionService.completeSession(
      userId,
      sessionId,
      updateDto.status,
    );
    return { session, repRangeAlerts };
  }
}

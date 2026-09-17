import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PlateauService } from './plateau.service';
import {
  PlateauAlertItemDto,
  PlateauAlertsResponseDto,
  ExercisePlateauStatusDto,
} from './dto/plateau-alert.dto';

@Controller('plateau')
@UseGuards(JwtAuthGuard)
export class PlateauController {
  constructor(private readonly plateauService: PlateauService) {}

  @Get('alerts')
  async getAlerts(@CurrentUser('id') userId: string): Promise<PlateauAlertsResponseDto> {
    const alerts = await this.plateauService.getActiveAlerts(userId);
    return {
      data: alerts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('alerts/:exerciseName')
  async getAlertByExercise(
    @CurrentUser('id') userId: string,
    @Param('exerciseName') exerciseName: string,
  ): Promise<ExercisePlateauStatusDto> {
    return this.plateauService.getAlertByExercise(userId, exerciseName);
  }

  @Patch('alerts/:alertId/presented')
  async markPresented(
    @CurrentUser('id') userId: string,
    @Param('alertId') alertId: string,
  ): Promise<{ ok: true }> {
    await this.plateauService.markPresented(userId, alertId);
    return { ok: true };
  }

  @Patch('alerts/:alertId/action')
  async actionAlert(
    @CurrentUser('id') userId: string,
    @Param('alertId') alertId: string,
    @Body() body: { weight: number },
  ): Promise<{ ok: true }> {
    await this.plateauService.actionAlert(userId, alertId, body.weight);
    return { ok: true };
  }
}

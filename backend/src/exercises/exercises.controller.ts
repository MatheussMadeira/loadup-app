import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('training-sheet/days/:dayOfWeek/exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  async addExercise(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() createDto: CreateExerciseDto,
  ) {
    return this.exercisesService.addExerciseToDay(userId, dayOfWeek.toLowerCase(), createDto);
  }

  @Get()
  async getExercises(@CurrentUser('id') userId: string, @Param('dayOfWeek') dayOfWeek: string) {
    return this.exercisesService.getExercisesForDay(userId, dayOfWeek.toLowerCase());
  }

  @Get(':exerciseId')
  async getExercise(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.exercisesService.getExerciseById(userId, dayOfWeek.toLowerCase(), exerciseId);
  }

  @Patch('reorder')
  async reorderExercises(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Body() body: { orderedIds: string[] },
  ) {
    return this.exercisesService.reorderExercisesInDay(userId, dayOfWeek.toLowerCase(), body.orderedIds);
  }

  @Patch(':exerciseId')
  async updateExercise(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Param('exerciseId') exerciseId: string,
    @Body() updateDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.updateExerciseInDay(
      userId,
      dayOfWeek.toLowerCase(),
      exerciseId,
      updateDto,
    );
  }

  @Delete(':exerciseId')
  @HttpCode(204)
  async deleteExercise(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    await this.exercisesService.deleteExerciseFromDay(userId, dayOfWeek.toLowerCase(), exerciseId);
  }

  @Patch(':exerciseId/series/bulk-suggested-weight')
  async bulkUpdateSuggestedWeight(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Param('exerciseId') exerciseId: string,
    @Body()
    body: {
      updates: Array<{ seriesOrder: number; suggestedWeight: number | null }>;
      markAsNew?: boolean;
    },
  ) {
    return this.exercisesService.bulkUpdateSuggestedWeight(
      userId,
      dayOfWeek.toLowerCase(),
      exerciseId,
      body.updates,
      body.markAsNew ?? false,
    );
  }

  @Patch(':exerciseId/series/:seriesOrder/suggested-weight')
  async updateSuggestedWeight(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Param('exerciseId') exerciseId: string,
    @Param('seriesOrder') seriesOrder: string,
    @Body() body: { suggestedWeight: number | null },
  ) {
    return this.exercisesService.updateSuggestedWeight(
      userId,
      dayOfWeek.toLowerCase(),
      exerciseId,
      Number(seriesOrder),
      body.suggestedWeight,
    );
  }

  @Patch(':exerciseId/series/:seriesOrder/suggestions')
  async updateSeriesSuggestions(
    @CurrentUser('id') userId: string,
    @Param('dayOfWeek') dayOfWeek: string,
    @Param('exerciseId') exerciseId: string,
    @Param('seriesOrder') seriesOrder: string,
    @Body()
    body: {
      suggestedWeight?: number | null;
      suggestedReps?: number | null;
      suggestedRestTime?: number | null;
    },
  ) {
    return this.exercisesService.updateSeriesSuggestions(
      userId,
      dayOfWeek.toLowerCase(),
      exerciseId,
      Number(seriesOrder),
      body,
    );
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingSessionController } from './training-session.controller';
import { TrainingSessionService } from './training-session.service';
import { TrainingSession, TrainingSessionSchema } from './schemas/training-session.schema';
import {
  TrainingSheet,
  TrainingSheetSchema,
} from '../training-sheet/schemas/training-sheet.schema';
import { PlateauAlert, PlateauAlertSchema } from '../plateau/schemas/plateau-alert.schema';
import { PlateauModule } from '../plateau/plateau.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingSession.name, schema: TrainingSessionSchema },
      { name: TrainingSheet.name, schema: TrainingSheetSchema },
      { name: PlateauAlert.name, schema: PlateauAlertSchema },
    ]),
    PlateauModule,
  ],
  controllers: [TrainingSessionController],
  providers: [TrainingSessionService],
  exports: [TrainingSessionService],
})
export class TrainingSessionModule {}

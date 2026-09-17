import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlateauAlert, PlateauAlertSchema } from './schemas/plateau-alert.schema';
import {
  TrainingSession,
  TrainingSessionSchema,
} from '../training-session/schemas/training-session.schema';
import { PlateauAnalyzer } from './plateau.analyzer';
import { PlateauService } from './plateau.service';
import { SessionCompletedListener } from './listeners/session-completed.listener';
import { PlateauController } from './plateau.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlateauAlert.name, schema: PlateauAlertSchema },
      { name: TrainingSession.name, schema: TrainingSessionSchema },
    ]),
  ],
  controllers: [PlateauController],
  providers: [PlateauAnalyzer, PlateauService, SessionCompletedListener],
  exports: [PlateauService],
})
export class PlateauModule {}

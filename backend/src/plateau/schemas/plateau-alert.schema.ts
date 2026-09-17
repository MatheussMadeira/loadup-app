import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlateauAlertDocument = PlateauAlert & Document;

@Schema({ collection: 'plateau_alerts', timestamps: false })
export class PlateauAlert {
  @Prop({ required: true, type: Types.ObjectId, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  exerciseName: string;

  @Prop({ required: true })
  dayOfWeek: string;

  @Prop({ required: true, enum: ['exercise', 'day', 'rep-range-max'] })
  alertType: 'exercise' | 'day' | 'rep-range-max';

  @Prop({ type: String, default: null })
  suggestion: string | null;

  @Prop({ required: true, default: 0 })
  sessionCount: number;

  @Prop({ required: true })
  detectedAt: Date;

  @Prop({ type: Date, default: null })
  resolvedAt: Date | null;

  @Prop({ required: true, default: true, index: true })
  active: boolean;

  /** Quando o modal foi de fato mostrado ao usuário durante o treino. */
  @Prop({ type: Date, default: null })
  presentedAt: Date | null;

  /** Quando o usuário confirmou um novo peso a partir deste alerta. */
  @Prop({ type: Date, default: null })
  actionedAt: Date | null;

  /** O peso confirmado, para auditoria/depuração. */
  @Prop({ type: Number, default: null })
  actionedWeight: number | null;
}

export const PlateauAlertSchema = SchemaFactory.createForClass(PlateauAlert);

PlateauAlertSchema.index({ userId: 1, exerciseName: 1, alertType: 1 }, { unique: true });
PlateauAlertSchema.index({ userId: 1, active: 1 });

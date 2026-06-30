import { Schema, model, Document } from 'mongoose';

export interface IDailyActivity {
  date: Date;
  count: number; // weight of work done e.g. 1, 2, 3 tasks
}

export interface IRadarMetric {
  subject: string; // e.g., "Frontend", "Backend", "DSA", "DevOps"
  score: number;   // 0 to 100
}

export interface IProgress extends Document {
  user: Schema.Types.ObjectId;
  dailyActivity: IDailyActivity[];
  radarMetrics: IRadarMetric[];
  consistencyScore: number; // 0-100 percentage based on daily streak history
  xpHistory: { date: Date; points: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const DailyActivitySchema = new Schema<IDailyActivity>({
  date: { type: Date, required: true, default: Date.now },
  count: { type: Number, default: 1 },
});

const RadarMetricSchema = new Schema<IRadarMetric>({
  subject: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
});

const ProgressSchema = new Schema<IProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dailyActivity: { type: [DailyActivitySchema], default: [] },
    radarMetrics: { type: [RadarMetricSchema], default: [] },
    consistencyScore: { type: Number, default: 0 },
    xpHistory: [{
      date: { type: Date, default: Date.now },
      points: { type: Number, default: 0 },
    }],
  },
  { timestamps: true }
);

export const Progress = model<IProgress>('Progress', ProgressSchema);

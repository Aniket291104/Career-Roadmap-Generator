import { Schema, model, Document } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  badgeCode: string; // e.g. "streak_7", "quiz_master", "portfolio_pro"
  icon: string;      // Lucide icon name
  category: 'streak' | 'quiz' | 'roadmap' | 'portfolio' | 'interview';
  xpReward: number;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    badgeCode: { type: String, required: true, unique: true },
    icon: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['streak', 'quiz', 'roadmap', 'portfolio', 'interview'], 
      required: true 
    },
    xpReward: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const Achievement = model<IAchievement>('Achievement', AchievementSchema);

import { Schema, model, Document } from 'mongoose';

export interface ILanguageInfo {
  name: string;
  percentage: number;
}

export interface IRepoBrief {
  name: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  hasReadme: boolean;
}

export interface IPortfolio extends Document {
  user: Schema.Types.ObjectId;
  githubUrl: string;
  reposCount: number;
  languages: ILanguageInfo[];
  repositories: IRepoBrief[];
  portfolioScore: number; // 0-100 overall
  readmeQuality: string; // e.g. "needs_work", "good", "excellent"
  commitActivity: string; // e.g. "active", "sporadic", "stale"
  suggestions: string; // Markdown recommendations
  createdAt: Date;
  updatedAt: Date;
}

const LanguageInfoSchema = new Schema<ILanguageInfo>({
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
});

const RepoBriefSchema = new Schema<IRepoBrief>({
  name: { type: String, required: true },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  primaryLanguage: { type: String },
  hasReadme: { type: Boolean, default: false },
});

const PortfolioSchema = new Schema<IPortfolio>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    githubUrl: { type: String, required: true },
    reposCount: { type: Number, default: 0 },
    languages: { type: [LanguageInfoSchema], default: [] },
    repositories: { type: [RepoBriefSchema], default: [] },
    portfolioScore: { type: Number, default: 0 },
    readmeQuality: { type: String, default: 'needs_work' },
    commitActivity: { type: String, default: 'sporadic' },
    suggestions: { type: String, required: true },
  },
  { timestamps: true }
);

export const Portfolio = model<IPortfolio>('Portfolio', PortfolioSchema);

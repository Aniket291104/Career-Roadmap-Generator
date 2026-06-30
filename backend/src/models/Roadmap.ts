import { Schema, model, Document } from 'mongoose';

export interface IDailyTask {
  dayNumber: number;
  title: string;
  description: string;
  codingPractice?: string; // Coding exercise description or code prompt
  status: 'pending' | 'completed';
}

export interface IResourceLink {
  title: string;
  url: string;
  type: 'docs' | 'youtube' | 'course' | 'github' | 'blog' | 'book' | 'practice';
}

export interface IProjectBrief {
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  folderStructure?: string;
  deploymentGuide?: string;
}

export interface IWeeklyMilestone {
  weekNumber: number;
  title: string;
  description: string;
  learningGoals: string[];
  dailyTasks: IDailyTask[];
  resources: IResourceLink[];
  projects: IProjectBrief[];
}

export interface IMonthlyMilestone {
  monthNumber: number;
  title: string;
  description: string;
  weeks: IWeeklyMilestone[];
}

export interface IRoadmap extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  targetRole: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string; // e.g., "12 Weeks" or "3 Months"
  skillsCovered: string[];
  timeline: IMonthlyMilestone[];
  isCompleted: boolean;
  progressPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

const DailyTaskSchema = new Schema<IDailyTask>({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  codingPractice: { type: String },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

const ResourceLinkSchema = new Schema<IResourceLink>({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['docs', 'youtube', 'course', 'github', 'blog', 'book', 'practice'], 
    required: true 
  },
});

const ProjectBriefSchema = new Schema<IProjectBrief>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: [String], default: [] },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  estimatedHours: { type: Number, default: 5 },
  folderStructure: { type: String },
  deploymentGuide: { type: String },
});

const WeeklyMilestoneSchema = new Schema<IWeeklyMilestone>({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  learningGoals: { type: [String], default: [] },
  dailyTasks: { type: [DailyTaskSchema], default: [] },
  resources: { type: [ResourceLinkSchema], default: [] },
  projects: { type: [ProjectBriefSchema], default: [] },
});

const MonthlyMilestoneSchema = new Schema<IMonthlyMilestone>({
  monthNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  weeks: { type: [WeeklyMilestoneSchema], default: [] },
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    targetRole: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    estimatedDuration: { type: String, required: true },
    skillsCovered: { type: [String], default: [] },
    timeline: { type: [MonthlyMilestoneSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    progressPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Roadmap = model<IRoadmap>('Roadmap', RoadmapSchema);

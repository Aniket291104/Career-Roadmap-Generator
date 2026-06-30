import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  user: Schema.Types.ObjectId;
  roadmapId?: Schema.Types.ObjectId;
  title: string;
  description: string;
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  features: string[];
  folderStructure?: string;
  deploymentGuide?: string;
  githubUrl?: string;
  status: 'suggested' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: { type: [String], default: [] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    estimatedHours: { type: Number, default: 10 },
    features: { type: [String], default: [] },
    folderStructure: { type: String },
    deploymentGuide: { type: String },
    githubUrl: { type: String },
    status: { 
      type: String, 
      enum: ['suggested', 'in_progress', 'completed'], 
      default: 'suggested' 
    },
  },
  { timestamps: true }
);

export const Project = model<IProject>('Project', ProjectSchema);

import { Schema, model, Document } from 'mongoose';

export interface IResume extends Document {
  user: Schema.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  atsScore: number;
  missingSkills: string[];
  missingKeywords: string[];
  suggestions: string; // Markdown formatted recommendations
  improvedVersionUrl?: string; // Links to PDF generated improvements
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    atsScore: { type: Number, required: true, default: 0 },
    missingSkills: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    suggestions: { type: String, required: true },
    improvedVersionUrl: { type: String },
  },
  { timestamps: true }
);

export const Resume = model<IResume>('Resume', ResumeSchema);

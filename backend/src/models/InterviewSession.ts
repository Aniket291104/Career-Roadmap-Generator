import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  audioUrl?: string; // Optional voice playback
}

export interface IInterviewSession extends Document {
  user: Schema.Types.ObjectId;
  type: 'technical' | 'hr' | 'behavioral' | 'coding';
  roleGoal: string; // e.g. "React developer"
  messages: IMessage[];
  overallScore: number;
  grammarRating: number;   // 0-100
  technicalRating: number; // 0-100
  behavioralRating: number; // 0-100
  feedback: string;        // Markdown detailed evaluation
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['interviewer', 'candidate'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  audioUrl: { type: String },
});

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['technical', 'hr', 'behavioral', 'coding'], 
      required: true 
    },
    roleGoal: { type: String, required: true },
    messages: { type: [MessageSchema], default: [] },
    overallScore: { type: Number, default: 0 },
    grammarRating: { type: Number, default: 0 },
    technicalRating: { type: Number, default: 0 },
    behavioralRating: { type: Number, default: 0 },
    feedback: { type: String },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const InterviewSession = model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export interface IInterviewSession extends Document {
  user: Schema.Types.ObjectId;
  type: string; // e.g. "Frontend", "Backend", "Full Stack"
  company: string; // e.g. "Google", "OpenAI"
  difficulty: string; // e.g. "FAANG", "Hard"
  duration: number; // e.g. 45
  mode: 'practice' | 'strict';
  currentRound: 'coding' | 'behavioral' | 'design' | 'feedback';
  messages: IMessage[];
  overallScore: number;
  subScores: {
    coding: number;
    communication: number;
    confidence: number;
    technical: number;
    behavior: number;
  };
  liveMetrics: {
    eyeContact: number;
    speakingSpeed: number;
    fillerWords: number;
    stressLevel: number;
  };
  feedback: string; // Markdown summary report
  submittedCode?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['interviewer', 'candidate'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    company: { type: String, required: true },
    difficulty: { type: String, required: true },
    duration: { type: Number, required: true },
    mode: { type: String, enum: ['practice', 'strict'], default: 'strict' },
    currentRound: { type: String, enum: ['coding', 'behavioral', 'design', 'feedback'], default: 'coding' },
    messages: { type: [MessageSchema], default: [] },
    overallScore: { type: Number, default: 0 },
    subScores: {
      coding: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      behavior: { type: Number, default: 0 },
    },
    liveMetrics: {
      eyeContact: { type: Number, default: 0 },
      speakingSpeed: { type: Number, default: 0 },
      fillerWords: { type: Number, default: 0 },
      stressLevel: { type: Number, default: 0 },
    },
    feedback: { type: String, default: '' },
    submittedCode: { type: String },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const InterviewSession = model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

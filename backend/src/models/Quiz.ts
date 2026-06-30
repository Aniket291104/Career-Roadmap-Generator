import { Schema, model, Document } from 'mongoose';

export interface IQuizQuestion {
  _id?: any;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  userAnswerIndex?: number;
  explanation?: string;
  topic: string; // e.g. "React Hooks", "Mongoose schema", "SQL joins"
}

export interface IQuiz extends Document {
  user: Schema.Types.ObjectId;
  category: string; // e.g. "Full Stack Programming Assessment"
  questions: IQuizQuestion[];
  scorePercent: number;
  strongAreas: string[];
  weakAreas: string[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswerIndex: { type: Number, required: true },
  userAnswerIndex: { type: Number },
  explanation: { type: String },
  topic: { type: String, required: true },
});

const QuizSchema = new Schema<IQuiz>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    questions: { type: [QuizQuestionSchema], default: [] },
    scorePercent: { type: Number, default: 0 },
    strongAreas: { type: [String], default: [] },
    weakAreas: { type: [String], default: [] },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>('Quiz', QuizSchema);

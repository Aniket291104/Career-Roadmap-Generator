import { Schema, model, Document } from 'mongoose';

export interface IExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ITestCase {
  input: string;
  output: string;
  isHidden: boolean;
}

export interface IChatInteraction {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
}

export interface ICodingAssessment extends Document {
  user: Schema.Types.ObjectId;
  language: string;
  difficulty: string;
  topic: string;
  title: string;
  description: string;
  constraints: string[];
  examples: IExample[];
  codeTemplate: string;
  testCases: ITestCase[];
  optimalSolution: string;
  hints: string[];
  hintsUnlocked: number[]; // Index of unlocked hints (0, 1, 2)
  submittedCode?: string;
  score: number;
  questionHash: string;
  isCompleted: boolean;
  aiReview?: {
    correctness: string;
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string;
  };
  chatInteractions: IChatInteraction[];
  createdAt: Date;
  updatedAt: Date;
}

const ExampleSchema = new Schema<IExample>({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
});

const TestCaseSchema = new Schema<ITestCase>({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const ChatInteractionSchema = new Schema<IChatInteraction>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const CodingAssessmentSchema = new Schema<ICodingAssessment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    language: { type: String, required: true },
    difficulty: { type: String, required: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    constraints: { type: [String], default: [] },
    examples: { type: [ExampleSchema], default: [] },
    codeTemplate: { type: String, required: true },
    testCases: { type: [TestCaseSchema], default: [] },
    optimalSolution: { type: String, required: true },
    hints: { type: [String], default: [] },
    hintsUnlocked: { type: [Number], default: [] },
    submittedCode: { type: String },
    score: { type: Number, default: 0 },
    questionHash: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    aiReview: {
      correctness: { type: String },
      timeComplexity: { type: String },
      spaceComplexity: { type: String },
      suggestions: { type: String },
    },
    chatInteractions: { type: [ChatInteractionSchema], default: [] },
  },
  { timestamps: true }
);

export const CodingAssessment = model<ICodingAssessment>('CodingAssessment', CodingAssessmentSchema);

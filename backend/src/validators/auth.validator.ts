import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'mentor', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  college: z.string().optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().optional(),
  experience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
  careerGoal: z.string().optional(),
  learningStyle: z.enum(['visual', 'practical', 'theoretical', 'mixed']).optional(),
  dailyStudyHours: z.number().min(1).max(24).optional(),
  preferredLanguage: z.string().optional(),
});

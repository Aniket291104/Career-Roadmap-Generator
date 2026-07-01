import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MongoDB URI is not defined in environment variables.');
    process.exit(1);
  }

  // Auto-correct common typo: using "-" or "/" instead of "?" before query parameters (e.g., retryWrites)
  if (uri.includes('retryWrites') && !uri.includes('?')) {
    const match = uri.match(/[-/](retryWrites=true.*)$/);
    if (match) {
      const rest = match[1];
      const base = uri.substring(0, uri.length - match[0].length);
      uri = `${base}?${rest}`;
      console.warn(`[URI Auto-correct] Corrected MONGODB_URI to end with '?${rest}'`);
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    // In development/test mode, we will allow it to fail and not exit to allow mockup mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

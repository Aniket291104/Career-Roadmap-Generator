import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the parent backend folder or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to local directory

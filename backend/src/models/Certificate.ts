import { Schema, model, Document } from 'mongoose';

export interface ICertificate extends Document {
  user: Schema.Types.ObjectId;
  roadmapId: Schema.Types.ObjectId;
  title: string;
  recipientName: string;
  credentialId: string; // Unique hash e.g. ACCR-2026-XXXXX
  issuedAt: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    title: { type: String, required: true },
    recipientName: { type: String, required: true },
    credentialId: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

export const Certificate = model<ICertificate>('Certificate', CertificateSchema);

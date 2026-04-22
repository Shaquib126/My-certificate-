import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  category: 'Work' | 'Personal' | 'Certificate' | 'Identity';
  cloudinaryUrl: string;
  publicId: string;
  userId: mongoose.Types.ObjectId;
  fileType?: string;
  tags?: string[];
}

const DocumentSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Certificate', 'Identity'],
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileType: {
    type: String,
    default: 'unknown'
  },
  tags: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model<IDocument>('Document', DocumentSchema);

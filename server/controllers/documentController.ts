import { Response } from 'express';
import Document from '../models/Document';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, tags } = req.body;
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (err) {
        parsedTags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    // Wrap Cloudinary upload_stream in a promise
    const uploadToCloudinary = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'vault_documents', resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    // Determine initial fileType extension from original filename
    const fileExt = req.file.originalname.split('.').pop()?.toLowerCase() || 'unknown';

    const newDocument = await Document.create({
      title,
      category,
      tags: parsedTags,
      cloudinaryUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      userId: req.user?.userId,
      fileType: cloudinaryResult.format || fileExt,
    });

    res.status(201).json(newDocument);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const documents = await Document.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.status(200).json(documents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const docId = req.params.id;
    const document = await Document.findOne({ _id: docId, userId: req.user?.userId });

    if (!document) {
      res.status(404).json({ message: 'Document not found or unauthorized' });
      return;
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.publicId);

    // Delete from MongoDB
    await document.deleteOne();

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const docId = req.params.id;
    const { title, tags } = req.body;

    const document = await Document.findOne({ _id: docId, userId: req.user?.userId });
    
    if (!document) {
      res.status(404).json({ message: 'Document not found or unauthorized' });
      return;
    }

    if (title !== undefined) document.title = title;
    if (tags !== undefined) document.tags = tags;

    await document.save();
    
    res.status(200).json(document);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

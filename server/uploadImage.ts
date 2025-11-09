import { Request, Response } from "express";
import { storagePut } from "./storage";

export async function uploadImageHandler(req: Request, res: Response) {
  try {
    const { image, filename } = req.body;

    if (!image || !filename) {
      return res.status(400).json({ error: "Missing image or filename" });
    }

    // Extract base64 data
    const matches = image.match(/^data:image\/([a-z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const [, extension, base64Data] = matches;
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `card-images/${timestamp}-${randomSuffix}.${extension}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, buffer, `image/${extension}`);

    res.json({ url });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
}

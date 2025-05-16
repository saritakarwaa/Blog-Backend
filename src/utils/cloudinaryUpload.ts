import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const uploadToCloudinary = async (localPath: string, folder: string) => {
  if (!localPath) return null;

  const result = await cloudinary.uploader.upload(localPath, {
    folder,
    resource_type: "auto", // Automatically handles images and videos
  });

  fs.unlinkSync(localPath); // remove local file after upload
  return result.secure_url;
};

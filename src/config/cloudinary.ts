import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config()


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadToCloudinary = async (localPath: string, folder: string) => {
  if (!localPath) return null;

  const result = await cloudinary.uploader.upload(localPath, {
    folder,
    resource_type: "auto",
  });
  return result.secure_url;
};
export default cloudinary
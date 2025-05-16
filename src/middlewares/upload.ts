import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary'

const storage=new CloudinaryStorage({
    cloudinary,
    params:async(req,file)=>{
        let folder='blog-app/others'
        let resource_type='image'
        if (file.fieldname === 'profilePicture') {
            folder = 'blog-app/profile-pictures';
        } else if (file.fieldname === 'blogImage') {
            folder = 'blog-app/blog-images';
        } else if (file.fieldname === 'blogVideo') {
            folder = 'blog-app/blog-videos';
            resource_type = 'video';
        }
        return{
            folder,
            resource_type,
            format:file.mimetype.split('/')[1],
        }
    }
})
const upload = multer({ storage });

export default upload;
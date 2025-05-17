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
        console.log('Uploading to Cloudinary folder:', folder);
        return{
            folder,
            resource_type,
            format:file.mimetype.split('/')[1] || 'jpg',
        }
    }
})
const upload = multer({ storage,
    limits:{fileSize:10*1024*1024},//10MB 
    fileFilter:(req,file,cb)=>{
        const allowedTypes=['image/jpeg','image/jpg','image/png','video/mp4']
        if(allowedTypes.includes(file.mimetype)){
            cb(null,true)
        }
        else{
            cb(null,false)
        }
    }
 });

export default upload;
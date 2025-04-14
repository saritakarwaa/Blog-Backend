import multer from 'multer'
import path from 'path'

const storage=multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(__dirname,'../../uploads'))
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `${Date.now()}.${ext}`);
      }
})
const upload = multer({ storage });

export default upload;
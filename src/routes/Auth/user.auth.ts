import express,{Request,Response,Router} from 'express'
import { login, signup,getProfile, GoogleAuth,updateUser} from '../../controllers/AuthController';
import { protect } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/upload';


const router: Router = express.Router();


router.post('/signup',signup)
router.post('/login',login)
router.post('/google',GoogleAuth as express.RequestHandler)
router.get('/:userId/profile',protect,getProfile)


router.put('/:userId/update', protect, upload.single("profilePicture"), updateUser as express.RequestHandler);

export default router
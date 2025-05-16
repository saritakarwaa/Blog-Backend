import express,{Request,Response,Router} from 'express'
import { login, signup,getProfile, GoogleAuth,updateUser,getMe, forgotPassword,resetPassword} from '../../controllers/AuthController';
import { protect } from '../../middlewares/auth.middleware';
import upload from '../../middlewares/upload';


const router: Router = express.Router();


router.post('/signup',signup)
router.post('/login',login)
router.post('/google',GoogleAuth as express.RequestHandler)
router.get('/:userId/profile',protect,getProfile)
router.get('/me',protect,getMe as express.RequestHandler)
router.put('/:userId/update', protect, upload.single('profilePicture'), updateUser as express.RequestHandler);4
router.post('/forgot-password',forgotPassword as express.RequestHandler)
router.post('/reset-password/:token',resetPassword as express.RequestHandler)

export default router
import express,{Request,Response,Router} from 'express'
import { login, signup,getProfile, GoogleAuth} from '../../controllers/AuthController';
import { protect } from '../../middlewares/auth.middleware';


const router: Router = express.Router();


router.post('/signup',signup)
router.post('/login',login)
router.post('/google',GoogleAuth as express.RequestHandler)
router.get('/:userId/profile',protect,getProfile)
//router.put('/:userId/profile',updateProfile)

export default router
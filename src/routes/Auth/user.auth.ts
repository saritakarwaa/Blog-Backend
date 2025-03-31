import express,{Request,Response,Router} from 'express'
import { login, signup } from '../../controllers/AuthController';


const router: Router = express.Router();


router.post('/signup',signup)
router.post('/login',login)
//router.get('/profile',getProfile)

export default router
import express,{Request,Response,Router} from 'express'
import { login, signup } from '../../controllers/AuthController';
//const app=express()

const router: Router = express.Router();


router.post('/signup',signup)
router.post('/login',login)

export default router
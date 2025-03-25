import express,{Request,Response,Router} from 'express'
import { login, signup } from '../../controllers/AuthController';
const app=express()

const router: Router = express.Router();

router.get('/login',login)
router.get('/signup',signup)

export default router
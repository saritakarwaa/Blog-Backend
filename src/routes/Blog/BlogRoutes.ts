import express, { Router } from 'express';
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog
  
} from '../../controllers/BlogController';
import {protect} from '../../middlewares/auth.middleware';

const router: Router = express.Router();

// Blog CRUD Routes
router.post('/',createBlog as express.RequestHandler); 
router.get('/', getAllBlogs); 
router.put('/:userId/:blogId',protect,updateBlog as express.RequestHandler)
router.delete('/:userId/:blogId',protect,deleteBlog as express.RequestHandler); 

export default router;

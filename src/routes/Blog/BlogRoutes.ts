import express, { Router } from 'express';
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getBlog,
  summarizeBlog
  
} from '../../controllers/BlogController';
import upload from '../../middlewares/upload';
import {protect} from '../../middlewares/auth.middleware';


const router: Router = express.Router();

router.post('/',protect,
  upload.fields([
    {name:'blogImage',maxCount:5},
    {name:'blogVideo',maxCount:1}
  ]),createBlog as express.RequestHandler); 
router.get('/', getAllBlogs); 
router.put('/:userId/:blogId',protect,
  upload.fields([
    {name:'blogImage',maxCount:5},
    {name:'blogVideo',maxCount:1}
  ]),updateBlog as express.RequestHandler)
router.delete('/:userId/:blogId',protect,deleteBlog as express.RequestHandler); 
router.get('/:userId/:blogId', protect,getBlog as express.RequestHandler)
router.post('/:userId/:blogId/summarize',protect,summarizeBlog as express.RequestHandler)

export default router;

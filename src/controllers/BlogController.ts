import { Request,Response } from "express";
import User from '../models/User'
import redis from '../config/redis';

export const createBlog=async(req:Request,res:Response)=>{
    try{
        const {userId,blogId,blogTitle,content,image,video,reaction}=req.body
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const newBlog={
            blogId,
            blogTitle,
            content,
            image,
            video,
            reaction:reaction || [
              {
                likes: 0,
                funny: 0,
                insightful: 0,
              }
            ]
        }
        user.blogs.push(newBlog);
        await user.save()
        res.status(201).json({
          message: "Blog created successfully",
          blog: newBlog,
        });
    }
    catch{
        res.status(500).json({ error: 'Error creating blog' });
    }
}

export const getAllBlogs = async (req: Request, res: Response) => {
    try {
      const cachedBlogs=await redis.get('allBlogs')
      if (cachedBlogs) {
        res.status(200).json(JSON.parse(cachedBlogs)); 
        return;
      }
      const users=await User.find()
      const blogs=users.flatMap(user=>user.blogs)
      await redis.setex('allBlogs', 3600, JSON.stringify(blogs)); 
      res.status(200).json(blogs);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching blogs' });
    }
};
  


export const updateBlog=async(req:Request,res:Response)=>{
    try {
        const { userId, blogId } = req.params;
        const { blogTitle, content, image, video, reaction } = req.body;
    
        const user = await User.findById(userId);
        console.log("user found:", user)
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        // Find the blog in the user's blogs array
        const blogIndex = user.blogs.findIndex((blog) => blog.blogId === blogId);
        //console.log("Blog Index:", blogIndex);
        if (blogIndex === -1) {
          return res.status(404).json({ error: "Blog not found" });
        }
  
        const existingBlog = user.blogs[blogIndex];
        //console.log("Existing Blog before update:", existingBlog);

        user.blogs[blogIndex] = {
          ...existingBlog, // Preserve existing values
          blogId: existingBlog.blogId, 
          blogTitle: blogTitle || existingBlog.blogTitle,
          content: content || existingBlog.content,
          image: image || existingBlog.image,
          video: video || existingBlog.video,
          reaction: reaction || existingBlog.reaction,
        };
    
        const updatedUser=await user.save();
        res.status(200).json(updatedUser.blogs[blogIndex]);
      } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Error updating blog" });
      }
}

export const deleteBlog=async(req:Request,res:Response)=>{
  try {
    const { userId, blogId } = req.params;
    const user = await User.findOne({id:userId});

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the index of the blog to be deleted
    const blogIndex = user.blogs.findIndex(blog => blog.blogId === blogId);

    if (blogIndex === -1) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Remove the blog from the user's blogs array
    user.blogs.splice(blogIndex, 1);

    await user.save();
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting blog' });
  }
}

export const getBlog=async(req:Request,res:Response)=>{
  try{
    const {userId,blogId}=req.params
    const user =  await User.findOne({ id: userId });
    if(!user) return res.status(404).json({error:"User not found"})
    if(!blogId)  return res.status(400).json({ error: "Invalid or missing blogId" });
    const cachedBlog = await redis.get(`blog:${userId}:${blogId}`);
    if (cachedBlog) {
      return res.status(200).json(JSON.parse(cachedBlog));
    }
    const blog=user.blogs.find((b)=>b.blogId===blogId)
    if(!blog) return res.status(404).json({ error: "Blog not found" });
    await redis.setex(`blog:${userId}:${blogId}`, 3600, JSON.stringify(blog)); 
    res.status(200).json(blog);
  }
  catch(error){
    console.error(error);
    res.status(500).json({ error: "Server error while fetching blog" });
  }
}

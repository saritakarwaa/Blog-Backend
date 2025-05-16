import {Request,Response} from 'express'
import User from "../models/User"
import bcrypt from "bcryptjs"
import generateToken from '../utils/generateToken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from "dotenv"
import redis from '../config/redis';
import crypto from "crypto"
import nodemailer from "nodemailer"

dotenv.config()
interface AuthRequest extends Request {
    user?: { id: string };
}

export const signup=async (req:Request,res:Response): Promise<void>=> {

    try{
        const {id,email,password}=req.body
        if(!id || !email || !password){
            res.status(400).json({ message: "Please provide all fields"})
        }

        const userExists=await User.findOne({email})

        if(userExists){
            res.status(400).json({message:"User already exists"})
            return
        }

        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const user=await User.create({
            id, 
            email,
            password:hashedPassword,
            blogs:[]
        })

        if(user){
            res.status(201).json({
                id:user.id,
                email:user.email,
                token:generateToken(user.id)
            })
        }
        else{
            res.status(400).json({message: "Invalid user data"})
        }
    }
    catch(error){
        res.status(500).json({message:"Server error"})
    }
}

export const login=async (req:Request,res:Response)=> {
    const {email,password}=req.body
    if (!email || !password){
        res.status(400).json({message:"Please provide all fields"})
    }
    const user=await User.findOne({email})
    
    if(user && (await bcrypt.compare(password,user.password))){
        res.json({
            _id:user._id,
            id:user.id,
            email:user.email,
            token:generateToken(user.id)
        })
    }
    else{
        res.status(401).json({message: "Invalid email or password"})
    }
}

export const getProfile=async (req:Request,res:Response):Promise<void>=>{
    try{
        const {userId}=req.params
        console.log("User id",userId)
        const cacheKey=`profile:${userId}`
        const cachedProfile = await redis.get(cacheKey);
        console.log("cached profile:",cachedProfile)
        if (cachedProfile) {
            res.status(200).json(JSON.parse(cachedProfile)); 
            return;
        }
        const user=await User.findById(userId).select('-password')
        if(!user){
            res.status(404).json({error:'User not found'})
        }
        await redis.set(cacheKey, JSON.stringify(user),'EX',30);
        res.status(200).json(user)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:'Error fetching user profile'})
        return;
    }
}

export const GoogleAuth=async (req:Request,res:Response)=>{
    const {token}=req.body
    const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    try{
        const ticket=await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload=ticket.getPayload()
        if(!payload){
            return res.status(400).json({ message: "Invalid Google token" });
        }
        let user=await User.findOne({email:payload.email})
        if(!user){
            user=await User.create({
                id:payload.sub,
                email:payload.email,
                password:"",
                blogs:[]
            })
        }
        const jwtToken=generateToken(user.id)
        res.json({
            id: user.id,
            email: user.email,
            token: jwtToken
        })
    }
    catch(error){
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateUser=async (req:Request,res:Response)=>{
    try{
        const {userId}=req.params
        const updateData: any = req.body

        console.log("Updating user:", userId);
        console.log("Request body:", req.body);
        console.log("Uploaded file:", req.file);

        if(req.file){
            updateData.profilePicture =req.file.path
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select('-password')
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json(updatedUser)
    }
    catch(error){
        console.error(error)
        res.status(500).json({ error: 'Error updating user' })
    }
}

export const getMe=async (req:AuthRequest,res:Response)=>{
    try{
        const user=await User.findOne({id:req.user?.id})
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        res.status(200).json({
            _id: user._id,
            id:user.id,
            email:user.email,
            blogs:user.blogs,
        })
    }
    catch(error){
        res.status(500).json({message:"Server error"})
    }
}

export const forgotPassword=async (req:Request,res:Response)=>{
    const {email}=req.body
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({message:"User with this email does not exist"})
        }
        const resetToken=crypto.randomBytes(32).toString("hex")
        const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex")

        user.resetPasswordToken=hashedToken
        user.resetPasswordExpires=Date.now()+15*60*1000
        await user.save()

        const resetUrl=`${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
        });
        const message = {
            from: `"Blog App" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
              <p>Hello,</p>
              <p>You requested to reset your password. Click the link below:</p>
              <a href="${resetUrl}">${resetUrl}</a>
              <p>This link will expire in 15 minutes.</p>
            `,
        };
        await transporter.sendMail(message);
        res.status(200).json({ message: "Reset link sent to email" });
    }
    catch(error){
        console.error("Error in forgotPassword:", error)
        res.status(500).json({message:"Server error"})
    }
}

export const resetPassword=async (req:Request, res:Response)=>{
    const {token}=req.params
    const {newPassword}=req.body
    const hashedToken=crypto.createHash("sha256").update(token).digest("hex")
    const user=await User.findOne({
        resetPasswordToken:hashedToken,
        resetPasswordExpires:{$gt: Date.now()}
    })
    if(!user) {
        return res.status(400).json({ message: "Token is invalid or has expired." });
    }
    const hashedPassword=await bcrypt.hash(newPassword,10)
    user.password=hashedPassword
    user.resetPasswordToken=undefined
    user.resetPasswordExpires=undefined
    await user.save()
    res.status(200).json({message:"Password reset successful!"})
}
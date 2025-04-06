import {Request,Response} from 'express'
import User from "../models/User"
import bcrypt from "bcryptjs"
import generateToken from '../utils/generateToken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from "dotenv"
//import asyncHandler from "express-async-handler"

dotenv.config()

export const signup=async (req:Request,res:Response): Promise<void>=> {
    //res.send("Get all users");
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
    //res.send("Get all users");
    const {email,password}=req.body
    if (!email || !password){
        res.status(400).json({message:"Please provide all fields"})
    }
    const user=await User.findOne({email})
    
    if(user && (await bcrypt.compare(password,user.password))){
        res.json({
            id:user.id,
            email:user.email,
            token:generateToken(user.id)
        })
    }
    else{
        res.status(401).json({message: "Invalid email or password"})
    }
}

export const getProfile=async (req:Request,res:Response): Promise<void>=>{
    try{
        const {userId}=req.params
        const user=await User.findById(userId).select('-password')
        if(!user){
            res.status(404).json({error:'User not found'})
        }
        res.status(200).json(user)
    }
    catch(error){
        console.log(error)
        res.status(500).json({error:'Error fetching user profile'})
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
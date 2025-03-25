import {Request,Response} from 'express'
import User from "../models/User"
import bcrypt from "bcryptjs"
import generateToken from '../utils/generateToken';
//import asyncHandler from "express-async-handler"


export const signup=async (req:Request,res:Response): Promise<void>=> {
    //res.send("Get all users");
    try{
        const {id,email,password}=req.body
    
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
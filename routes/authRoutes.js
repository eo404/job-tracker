const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require("../models/user");
const jwt = require('jsonwebtoken');



const {z} = require("zod");

const UserSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6)
});   

router.post("/register",async(req,res)=>{
    try
    {
       const result = UserSchema.safeParse(req.body)
       if(!result.success)
       {
            return res.status(400).json({
            "message": result.error.issues
         });
       }

        const existingUser = await User.findOne({
           $or:[ {username: req.body.username,
            email: req.body.email}]
        });

        if(existingUser){
            return res.status(400).json({
                "message": "User already exists"
            })
        }
        const {username,email,password}=req.body
        const hash  = await bcrypt.hash(password,10);
        
        await User.create({
            username,
            email,
            password : hash
        })

        return res.status(201).json({
            "message" : "User created successfully",
            'user':{
                username,
                email,
            }
        })
    
    }
    catch(error)
    {
        res.status(500).json({
            message: "Internal server error"
        })
    }
});

const signInSchema = z.object(
    {
        email: z.string().email(),
        password:z.string().min(6)
    }  
);

router.post("/login",async(req,res)=>{
    try
    {
        const result = signInSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({
                "message": result.error.issues
            });
        }
        const user =await User.findOne({email: req.body.email})
        if(!user)
        {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(req.body.password,user.password);
        if(!isMatch)
        {
            return res.status(401).json(
                { message: "Invalid credentials"}
            )
        }

        const token = jwt.sign({
            "userId": user._id, "username": user.username
        },process.env.JWT_SECRET,{
            expiresIn: '7d'
        });

        return res.status(200).json({
            
                "message": "Login successful",
                token
            
        })
    }
    catch(error)
    {
        res.status(500).json({
            message: "Internal server error"
        })
    }
});

module.exports = router
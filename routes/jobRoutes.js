const express = require("express")
const router = express.Router()

const Job = require('../models/job')

router.post("/",async(req,res)=>{
    try{
        const job = await Job.create(req.body)
        res.status(201).json(job)
    }catch(error)
    {
        res.status(400).json({
            "message": error.message
        })
    }
});

router.get("/",async(req,res)=>{
    try{
        const jobs = await Job.find()
        res.status(200).json(jobs) 
    }
    catch(error){
        res.status(500).json({
            'message':error.message
        })
    }
});

router.put("/:id",async(req,res)=>{
    const id  = req.params.id
    try
    {
        const data = req.body
        const job = await Job.findByIdAndUpdate(id,data,{new: true})
        if (!job) {
            return res.status(404).json({ message: 'Job not found' })
        }
        res.json(job)
    }
    catch(error)
    {
        res.status(404).json({
            "message":error
        })
    }
});

router.delete("/:id",async(req,res)=>{
    const id = req.params.id
    try
    {
        const job = await Job.findByIdAndDelete(id)
        if (job) {
            return res.json({
                "message": "Job deleted"
            })
        }
        else
        {
            return res.status(404).json({
                "message": "Job Not found"
            })
        }
    }
    catch(error)
    {
        res.status(404).json({
            "message": error.message
        })
    }
});

module.exports = router
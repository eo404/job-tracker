const express = require("express")
const router = express.Router()

const Job = require('../models/job')
const authMiddleware = require("../middleware/authMiddleware")

const jobSchema = z.object({
    company: z.string().min(2),
    role: z.string().min(2),
    status: z.enum(['Applied', "Interview", "Offer","Rejected"]).optional(),
    notes: z.string().optional()
})

router.post("/", authMiddleware,async(req,res)=>{
    try{
        const result = jobSchema.safeParse(req.body)
        if(!result.success)
        {
            return res.status(400).json(
                {
                    message: result.error.issues
                }
            )
        }
        const job = await Job.create({
            company: req.body.company,
            role: req.body.role,
            status: req.body.status,
            notes: req.body.notes,
            userId: req.user._id
        })
        res.status(201).json(job)
    }catch(error)
    {
        res.status(400).json({
            "message": error.message
        })
    }
});

router.get("/",authMiddleware,async(req,res)=>{
    try{
        const jobs = await Job.find({
            userId: req.user._id
        })
        res.status(200).json(jobs) 
    }
    catch(error){
        res.status(500).json({
            'message':error.message
        })
    }
});

router.put("/:id",authMiddleware,async(req,res)=>{
    const id  = req.params.id
    try
    {
        const job = await Job.findById(id); 
        if (!job) { return res.status(404).json({ message: "Job not found" }); }
        if (job.userId.toString() !== req.user._id.toString()) 
            { 
                return res.status(403).json({ message: "Forbidden" }); 
            
            }
        const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true }); 
        return res.status(200).json(updatedJob);
    }
    catch(error)
    {
        res.status(404).json({
            "message":error
        })
    }
});

router.delete("/:id",authMiddleware,async(req,res)=>{
    const id = req.params.id
    try
    {
        const job = await Job.findById(id)
        if(!job)
        {
            return res.status(404).json({
                message:"Job Not Found"
            })
        }
        if(job.userId.toString()!==req.user._id)
        {
            return res.status(403).json(
                {message:"Forbidden"}
            )
        }
        const delJob = await Job.findByIdAndDelete(id);
        return res.status(200).json(
            {
                'message':"Job deleted successfully"
            }
        )
    }
    catch(error)
    {
        res.status(500).json({
            "message": error.message
        })
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const { status, search, sort, page = 1, limit = 10 } = req.query;

        
    // Build filter
    const filter = {
        userId: req.user._id
    };

    if (status) {
        filter.status = status;
    }

    if (search) {
        filter.company = {
            $regex: search,
            $options: "i"
        };
    }

    // Build sort option
    let sortOption = {};

    switch (sort) {
        case "newest":
            sortOption = { createdAt: -1 };
            break;

        case "oldest":
            sortOption = { createdAt: 1 };
            break;

        case "company":
            sortOption = { company: 1 };
            break;

        case "status":
            sortOption = { status: 1 };
            break;

        default:
            sortOption = { createdAt: -1 };
    }

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const jobs = await Job.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(pageLimit);

    const totalJobs = await Job.countDocuments(filter);

    return res.status(200).json({
        jobs,
        pagination: {
            totalJobs,
            currentPage,
            totalPages: Math.ceil(totalJobs / pageLimit),
            pageLimit
        }
    });

} catch (error) {
    return res.status(500).json({
        message: error.message
    });
}


    });
    
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const jobs = await Job.find({
            userId: req.user._id
        });

        
    let applied = 0;
    let interview = 0;
    let offer = 0;
    let rejected = 0;

    for (const job of jobs) {
        if (job.status === "Applied") {
            applied++;
        } else if (job.status === "Interview") {
            interview++;
        } else if (job.status === "Offer") {
            offer++;
        } else if (job.status === "Rejected") {
            rejected++;
        }
    }

    return res.status(200).json({
        Applied: applied,
        Interview: interview,
        Offer: offer,
        Rejected: rejected,
        Total: jobs.length
    });

} catch (error) {
    return res.status(500).json({
        message: error.message
    });
}


    });




module.exports = router
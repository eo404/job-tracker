const express = require("express");
const mongoose =  require("mongoose");
const dotenv = require("dotenv");
const jobRoutes = require("./routes/jobRoutes")
const authRoutes = require("./routes/authRoutes")

dotenv.config();
const app = express();

app.use(express.json())
app.use('/api/jobs',jobRoutes)
app.use('/api/auth',authRoutes)

app.get('/',(req,res)=>{
    res.send("API is Running....")
})

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB Connected")
        app.listen(process.env.PORT,()=>{
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })
    .catch((error)=>{
        console.log("Connection Failed",error.message)
        process.exit(1)
    })
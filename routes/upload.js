const express = require("express")
const router = express.Router()

const uploadimg = require("../config/cloudinary.config");

router.post('/upload-image',uploadimg.single("picture"),(req,res)=>{
    if(!req.file){
        return res.status(400).json({ message: "Upload failed." })
    }
    return res.status(200).json({ url: req.file.path })
})

module.exports = router;
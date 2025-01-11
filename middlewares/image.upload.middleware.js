const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(__dirname, "../uploads/images");
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, {recursive: true})
}
module.exports = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir)
    },
    filename(req, file, cb){
        const validMimyTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
        if(validMimyTypes.includes(file.mimetype)){
            cb(null, Date.now() + path.extname(file.originalname))
        }
        else{
            cb(new Error("Invalid file type"), false)
        }
    }

})
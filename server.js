const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors")
const morgan = require("morgan")
require("dotenv").config();
const winston = require("winston")
// const router = require("./src/routers/router")
 

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);  
const io = new Server(server); 

// logger.info(path.join(__dirname, "/public"));


// app.use(express.static(path.join(__dirname, "/public")));
app.use("/",express.static("uploads/images"));



app.use(cors({
    origin: "http://192.168.90.185",
    // blacklist
    methods: ["GET", "POST"]
}))
app.use(morgan("dev"));

const {printf, timestamp, combine} = winston.format;
const customFormat = printf(({level, message, timestamp}) => {
    return `${timestamp} ${level} : ${message}`
})

const logger = winston.createLogger({
    foemat: combine(
        timestamp(),
        customFormat
    ),
    transports : [
        new winston.transports.Console()
    ]
})
app.use(express.json())

//http request
const multer = require("multer");
const storage = require("./middlewares/image.upload.middleware");

const upload = multer({storage});

app.post("/upload", upload.single("user_img"), (req, res) => {
    try {

        logger.info(req.file)
res.send("text")
    } catch (error) {
        logger.info(error)
    }
})



// app.use(router)
let socketsConnected = new Set();



io.on("connection", (socket) => {
    logger.info("Socket connected", socket.id);
    socketsConnected.add(socket.id);

    io.emit('clients-total', socketsConnected.size);

    socket.on("message", (data) => {
        logger.info("data",data);
        io.emit("chat-message", data)
    })
   
     

    socket.on("feedback", (data) => {
        socket.broadcast.emit("feedback", data);
    });

    socket.on("disconnect",()=>{
        logger.info("Socket disconnected", socket.id);
        socketsConnected.delete(socket.id);
        io.emit("clients-total", socketsConnected.size)
    })
})

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
});
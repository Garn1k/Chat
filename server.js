const http = require("http");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors")

require("dotenv").config();

// const router = require("./src/routers/router")
 

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);  
const io = new Server(server); 

console.log(path.join(__dirname, "/public"));


app.use(express.static(path.join(__dirname, "/public")));


app.use(cors())
app.use(express.json())

// app.use(router)
let socketsConnected = new Set();



io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    socketsConnected.add(socket.id);

    io.emit('clients-total', socketsConnected.size);

    socket.on("message", (data) => {
        console.log("data",data);
        io.emit("chat-message", data)
    })
   
     

    socket.on("feedback", (data) => {
        socket.broadcast.emit("feedback", data);
    });

    socket.on("disconnect",()=>{
        console.log("Socket disconnected", socket.id);
        socketsConnected.delete(socket.id);
        io.emit("clients-total", socketsConnected.size)
    })
})

server.listen(PORT, () => {
  console.log(`SERVER LISTEN ${PORT}`);
});
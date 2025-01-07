const http = require("http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const {Server} = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));



server.listen(PORT, () => {
    console.log("Server is running on port 5000");
})
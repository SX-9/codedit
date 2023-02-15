const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pty = require("node-pty");
const fs = require("fs");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors({ origin: "*" }));

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.get("/api/ls", (req, res) => {
  res.json(fs.readdirSync(process.cwd()));
});

io.on("connection", (socket) => {
  let ptyProcess = pty.spawn(process.env.SHELL, [], {
    name: process.env.TERMINAL,
    cols: 100,
    rows: 11,
    cwd: process.cwd(),
    env: process.env,
  });

  ptyProcess.on("data", function (data) {
    io.emit("terminal.incomingData", data);
  });

  socket.on("terminal.keystroke", (data) => {
    ptyProcess.write(data);
  });
});

httpServer.listen(8075, () => console.log("Online On Port 8075"));

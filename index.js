#! /bin/node

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pty = require("node-pty");
const fs = require("fs");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors({
  methods: ["GET","POST","DELETE"],
  origin: ["localhost","127.0.0.1"],
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(fs.readFileSync("./index.html", "utf8")
  .replace("/* c1 */", "#1d1d1d")
  .replace("/* c2 */", "#181818")
  .replace("/* c3 */", "#333333")
  );
});

app.use("/api/cat", express.static(process.cwd()));
app.get("/api/ls", (req, res) => res.json(fs.readdirSync(process.cwd()).filter(item => !item.startsWith("."))));
app.post("/api/touch/:name", (req, res) => {
  try {
    fs.writeFileSync(req.params.name, "");
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});
app.delete("/api/rm/:name", (req, res) => {
  try {
    fs.unlinkSync(req.params.name);
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});
app.post("/api/echo", (req, res) => {
  let { file, contents } = req.body;
  fs.writeFileSync(file, contents);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  let ptyProcess = pty.spawn(process.platform === "win32" ? "powershell.exe" : process.env.SHELL, [], {
    name: process.env.TERMINAL,
    cols: 120,
    rows: 12,
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

httpServer.listen(process.env.PORT || 8075, () => console.log("Code At http://localhost:8075"));

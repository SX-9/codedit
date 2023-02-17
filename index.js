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
  let html = `source: Error encountered while sourcing file '/data/data/com.termux/files/home/.local/share/omf/init.fish':
source: No such file or directory
sessions should be nested with care, unset $TMUX to force
[H[J[?25l[?7l[0m[32m[1m  ;,           ,;
   ';,.-----.,;'
  ,'           ',
 /    O     O    \
|                 |
'-----------------'[0m
[6A[9999999D[21C[38;5;15m[1m[32m[1mu0_a669[30m@[32m[1mlocalhost[0m 
[21C[38;5;15m[1m┌───────── Hardware Information ───────────┐[0m 
[21C[38;5;12m[1m​ ​ Model[0m[0m[33m =>[38;5;15m samsung SM-A505F[0m 
[21C[38;5;12m[1m​ ​ Disk (/apex/com.android.adbd)[0m[0m[33m =>[38;5;15m 4.8G / 5.0G (97%)[0m 
[21C[38;5;12m[1m​ ​ Memory[0m[0m[33m =>[38;5;15m 2665MiB / 3604MiB (73%)[0m 
[21C[38;5;15m[1m├────────── Software Information ──────────┤[0m 
[21C[38;5;12m[1m​ ​ Distro[0m[0m[33m =>[38;5;15m Android 11 aarch64[0m 
[21C[38;5;12m[1m​ ​ Kernel[0m[0m[33m =>[38;5;15m 4.14.113-24323734[0m 
[21C[38;5;12m[1m​ ​ Terminal[0m[0m[33m =>[38;5;15m tmux[0m 
[21C[38;5;12m[1m​ ​ Packages[0m[0m[33m =>[38;5;15m 471 (dpkg), 1 (pkg)[0m 
[21C[38;5;12m[1m​ ​ IP[0m[0m[33m =>[38;5;15m 192.168.1.2[0m 
[21C[38;5;15m[1m└──────────────────────────────────────────┘[0m 
[21C[38;5;15m[1m[0m 

[?25h[?7h<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm/css/xterm.css"/>
    <script src="https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js"></script>
    <script src="https://cdn.socket.io/socket.io-3.0.0.js"></script>
  	<script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.3.0/lib/xterm-addon-fit.js"></script> 
    <style>
      :root {
        --editor-color: /* c1 */;
        --explorer-color: /* c2 */;
        --sidebar-color: /* c3 */;
      }

      * {
        cursor: pointer;
      }
      body {
        overflow: hidden;
        height: 100vh;
        width: 100vw;
        background: var(--editor-color);
        display: grid;
        grid-template-areas:
          "bar files edit"
          "bar files term";
        grid-template-columns: 3em 12em 1fr;
        grid-template-rows: 1fr 15em;
        padding: 0;
        margin: 0;
      }

      p,
      textarea,
      h3 {
        font-family: monospace;
        color: white;
      }
      p.file {
        margin: 0.5em;
        padding-left: 0.5em;
        text-decoration: underline;
      }
      div#sidebar > p {
        padding: 1em;
        writing-mode: vertical-rl;
      }
      textarea {
        background: none;
        border: none;
        resize: none;
        width: 98%;
        height: 80%;
        margin: 0.5em;
      }
      h3 {
        text-align: center;
      }
      span.item {
        padding: 1em;
      }

      div#sidebar {
        background: var(--sidebar-color);
        grid-area: bar;
        display: flex;
        justify-content: center;
      }
      div#files {
        height: 100vh;
        overflow-y: scroll;
        overflow-x: hidden;
        background: var(--explorer-color);
        grid-area: files;
        border-right: 0.1em white solid;
      }
      div#editor {
        grid-area: edit;
      }
      div#terminal {
        grid-area: term;
        width: 100%;
        height: 100%;
      }
    </style>
    <title>CodedIt Editor</title>
  </head>
  <body>
    <div id="sidebar">
      <p id="save">
        <span id="save" class="item">Save</span>
        <span id="new" class="item">New</span>
        <span id="open" class="item">Open</span>
        <span id="del" class="item">Delete</span>
        <span id="refresh" class="item">Refresh</span>
      </p>
    </div>
    <div id="files">
      <h3>Explorer</h3>
    </div>
    <div id="editor">
      <h3 id="title">Editor</h3>
      <hr size="1" />
      <textarea id="file">Hello World!</textarea>
    </div>
    <div id="terminal"></div>
    <script>
      const socket = io("ws://localhost:8075");
      const term = new Terminal(),
        f = new FitAddon.FitAddon();

      term.loadAddon(f);
      f.fit();
      term.open(document.getElementById("terminal"));
      socket.on("terminal.incomingData", (data) => {
        term.write(data);
      });
      term.onData((data) => {
        socket.emit("terminal.keystroke", data);
      });

      async function cat() {
        let file =
          this.innerText !== "Open"
            ? this.innerText
            : prompt("Enter A File To Edit:");
        document.getElementById("title").innerText = file;
        let res = await fetch("/api/cat/" + file);
        let contents = await res.text();
        document.getElementById("file").value = contents;
      }

      async function ls() {
        let res = await fetch("/api/ls");
        let files = await res.json();
        document.getElementById("files").innerHTML = "<h3>Explorer</h3>";
        files.forEach((file) => {
          let el = document.createElement("p");
          el.innerText = file;
          el.onclick = cat;
          el.classList.add("file");
          document.getElementById("files").appendChild(el);
        });
      }

      function echo() {
        let contents = document.getElementById("file").value;
        let file = document.getElementById("title").innerText;
        fetch("/api/echo", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: file,
            contents: contents,
          }),
        })
          .then((res) => res.json())
          .then((d) => {
            alert(d.success ? "Success!" : "Failed!");
          });
      }

      async function touch() {
        let res = await fetch("/api/touch/" + prompt("File Name:"), { method: "POST" });
        let mess = await res.json();
        alert(mess.success ? "Success!" : "Failed!");
        ls();
      }

      async function rm(name) {
        let res = await fetch("/api/rm/" + name, { method: "DELETE" });
        let mess = await res.json();
        ls();
        return mess;
      }

      document.getElementById("del").onclick = () => alert(rm(prompt("File Name:")).success ? "Success!" : "Failed!");
      document.getElementById("new").onclick = touch;
      document.getElementById("save").onclick = echo;
      document.getElementById("open").onclick = cat;
      document.getElementById("refresh").onclick = ls;
      ls();
    </script>
  </body>
</html>
`;
  res.send(html
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

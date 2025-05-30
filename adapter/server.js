const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["POST"],
    credentials: false,
  })
);

app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const scanners = new Map();

wss.on("connection", (ws, req) => {
  ws.id = uuidv4();
  ws.typ = req.url === "/client" ? "client" : "scanner";
  ws.isAlive = true;
  ws.isRegistered = false;

  console.log(`Ny ${ws.typ} anslutning: ${ws.id}`);

  const registerTimeout = setTimeout(() => {
    if (ws.typ === "scanner" && !ws.isRegistered) {
      ws.terminate();
    }
  }, 10000);

  ws.on("pong", () => {
    ws.isAlive = true;
    console.log(`Pong mottaget från ${ws.typ}: ${ws.id}`);
  });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "register-scanner") {
        scanners.set(ws.id, {
          ws,
          status: "free",
          user: null,
        });
        ws.isRegistered = true;
        broadcastScannerList();
        console.log(`Scanner registrerad: ${ws.id}`);
      }

      if (data.type === "free") {
        if (scanners.has(ws.id)) {
          const scanner = scanners.get(ws.id);
          scanner.status = "free";
          scanner.user = null;
          broadcastScannerList();
          console.log(`Scanner frigjord: ${ws.id}`);
        }
      }

    } catch (err) {
      console.error("Felaktigt meddelande:", err);
    }
  });

  ws.on("close", () => {
    clearTimeout(registerTimeout);
    if (ws.typ === "scanner") {
      scanners.delete(ws.id);
      broadcastScannerList();
      console.log(`Scanner borttagen: ${ws.id}`);
    }
  });
});

function broadcastScannerList() {
  const scannerData = [...scanners.entries()].map(([id, { status, user }]) => ({
    id,
    status,
    user,
  }));

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.typ === "client") {
      client.send(
        JSON.stringify({ type: "scanner-list", scanners: scannerData })
      );
    }
  });
}

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

app.post("/assign", (req, res) => {
  const { user } = req.body;

  const entry = [...scanners.entries()].find(([_, scanner]) => scanner.status === "free");

  if (!entry) {
    return res.status(400).json({ fel: "Ingen ledig scanner tillgänglig" });
  }

  const [scannerId, scannerData] = entry;

  try {
    scannerData.ws.send(JSON.stringify({ type: "assign", user }));
    scannerData.status = "occupied";
    scannerData.user = user;
    broadcastScannerList();
    console.log("Tilldelar användare:", user, "till scanner:", scannerId);
    return res.json({ skickadTill: scannerId });
  } catch (err) {
    return res.status(500).json({ fel: "Kunde inte skicka till scanner" });
  }
});

app.get("/scanners", (req, res) => {
  const scannerList = [...scanners.entries()].map(([id, { status, user }]) => ({
    id,
    status,
    user,
  }));
  res.json({ scanners: scannerList });
});

server.listen(8080, () => {
  console.log("Servern lyssnar på port 8080");
});

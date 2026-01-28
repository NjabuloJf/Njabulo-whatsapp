
const fs = require('fs-extra');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const boom = require('@hapi/boom');
const conf = require("./set");
const axios = require("axios");
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const express = require('express');
const app = express();
const path = require('path');
const __path = path.join(__dirname);

app.use(express.static(__path));
app.use(express.json());

app.get('/pair', (req, res) => {
  res.sendFile(__path + '/pair.html');
});

let pairingCode = null;

app.post('/server', async (req, res) => {
  const number = req.body.number;
  pairingCode = await generatePairingCode(number);
  res.json({ code: pairingCode });
});

const port = process.env.PORT || 10000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

async function generatePairingCode(number) {
  // implement pairing code generation logic here
  // for demonstration purposes, let's assume the pairing code is a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function startBot() {
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth");
  const sockOptions = {
    version,
    logger: pino({ level: "silent" }),
    browser: ['Njabulo-Jb', "safari", "1.0.0"],
    printQRInTerminal: true,
    fireInitQueries: false,
    shouldSyncHistoryMessage: true,
    downloadHistory: true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false,
    keepAliveIntervalMs: 30_000,
    auth: {
      creds: state.creds,
      /** caching makes the store faster to send/recv messages */
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
        return msg.message || undefined;
      }
      return { conversation: 'An Error Occurred, Repeat Command!' };
    }
  };

  const zk = makeWASocket(sockOptions);
  const store = makeInMemoryStore({ logger: pino({ level: "silent" }) });
  store.bind(zk.ev);

  zk.ev.on("connection.update", async (con) => {
    const { lastDisconnect, connection } = con;
    if (connection === "connecting") {
      console.log("ℹ️ Njabulo Jb is connecting...");
    } else if (connection === 'open') {
      console.log("✅ Njabulo Jb- Connected to WhatsApp! ☺️");
      console.log("DULLAH XMD is Online 🕸\n\n");
      console.log("Loading Njabulo Jb Commands ...\n");
      fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
        if (path.extname(fichier).toLowerCase() == (".js")) {
          require(__dirname + "/commandes/" + fichier)(zk);
          console.log(fichier + " Loaded ✅");
        }
      });
      if (pairingCode) {
        await zk.sendMessage(zk.user.id, { text: `Your pairing code is: ${pairingCode}` });
      }
    } else if (connection == "close") {
      let raisonDeconnexion = new boom.Boom(lastDisconnect?.error)?.output.statusCode;
      if (raisonDeconnexion === DisconnectReason.badSession) {
        console.log('Session id error, rescan again...');
      } else if (raisonDeconnexion === DisconnectReason.connectionClosed) {
        console.log('!!! connexion fermée, reconnexion en cours ...');
        // ...
      }
    }
  });

  zk.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    // Add your message handling logic here
  });
}

startBot();

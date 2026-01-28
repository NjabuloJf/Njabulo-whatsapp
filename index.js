
const fs = require('fs-extra');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');
const boom = require('@hapi/boom');
const conf = require("./set");
const axios = require("axios");
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
// const { verifierEtatJid, recupererActionJid } = require("./bdd/antilien");
// const { atbverifierEtatJid, atbrecupererActionJid } = require("./bdd/antibot");
// const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./bdd/banUser");
// const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require("./bdd/banGroup");
// const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("./bdd/onlyAdmin");
const { reagir } = require(__dirname + "/njabulo/app");
const pairData = fs.readFileSync(__dirname + "/pair.html", "utf8");
const sessionData = pairData.replace(/<[^>]*>/g, '').trim();
const logger = pino({ level: "silent" });
const express = require('express');
const app = express();

const port = process.env.PORT || 10000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

async function authentification() {
  try {
    if (!fs.existsSync(__dirname + "/auth/creds.json")) {
      await fs.writeFileSync(__dirname + "/auth/creds.json", sessionData, "utf8");
    } else if (fs.existsSync(__dirname + "/auth/creds.json") && sessionData != "") {
      await fs.writeFileSync(__dirname + "/auth/creds.json", sessionData, "utf8");
    }
  } catch (e) {
    console.log("Error reading pair.html file: " + e);
    return;
  }
}

authentification();

const store = makeInMemoryStore({ 
  logger: logger,
});

setTimeout(() => {
  async function main() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth");
    const sockOptions = {
      version,
      logger: logger,
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
        keys: makeCacheableSignalKeyStore(state.keys, logger),
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
    store.bind(zk.ev);

    zk.ev.on("connection.update", async (con) => {
      const { lastDisconnect, connection } = con;
      if (connection === "connecting") {
        console.log("ℹ️ Njabulo Jb is connecting...");
      } else if (connection === 'open') {
        console.log("✅ Njabulo Jb- Connected to WhatsApp! ☺️");
        console.log("--");
        await (new Promise(resolve => setTimeout(resolve, 200)));
        console.log("------");
        await (new Promise(resolve => setTimeout(resolve, 300)));
        console.log("------------------/-----");
        console.log("DULLAH XMD is Online 🕸\n\n");
        let cmsg = `
          ┊ *ᯤɴᴊᴀʙᴜʟᴏ ᴊʙ: ᴄᴏɴɴᴇᴄᴛᴇᴅ*
          ┊┊ *ɴᴀᴍᴇ ɴᴊᴀʙᴜʟᴏ ᴊʙ*
          ┊┊ *ᴘʀᴇғɪx: [ ${conf.PREFIX} ]*
          ┊┊ *ᴍᴏᴅᴇ:* ${conf.MODE}
          Use .menu see commandes
        `;
        await zk.sendMessage(zk.user.id, {
          text: cmsg
        });
        // ...
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

  main();
}, 3000);


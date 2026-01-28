
const util = require('util');
const fs = require('fs-extra');
const { fana } = require(__dirname + "/../njabulo/fana");
const { format } = require(__dirname + "/../njabulo/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const Taphere = more.repeat(4001)

fana({ nomCom: "menu", categorie: "General" }, async (dest, zk, commandeOptions) => {
  let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
  let { cm } = require(__dirname + "/../njabulo//fana");

  var coms = {};
  var mode = "ρᥙbᥣιᥴ";
  if ((s.MODE).toLocaleLowerCase() != "yes") {
    mode = "ρrιvᥲtᥱ";
  }

  cm.map(async (com, index) => {
    if (!coms[com.categorie]) coms[com.categorie] = [];
    coms[com.categorie].push(com.nomCom);
  });

  moment.tz.setDefault("Africa/Botswana");
  const temps = moment().format('HH:mm:ss');
  const date = moment().format('DD/MM/YYYY');

  // Generate greeting based on time of day
  const hour = moment().hour();
  let greeting = "Good Mornιng";
  if (hour >= 12 && hour < 18) {
    greeting = "Good ᥲftᥱrnnon!";
  } else if (hour >= 18) {
    greeting = "Good Evᥱrnιng!";
  } else if (hour >= 22 || hour < 5) {
    greeting = "Good Nιght";
  }

  let infoMsg = `╭───────────⊷
┊▢nᥲmᥱ : *ɴᴊᴀʙᴜʟᴏ ᴊʙ*
┊▢ρrᥱfιx : *[ ${s.PREFIXE} ]*
┊▢modᥱ : *${mode}*
┊▢dᥲtᥱ : *${date}*
┊___________________________
┊ ①◦➛ᥣιst mᥱnᥙ
┊ ②◦➛ᥲι mᥱnᥙ
┊ ③◦➛gᥱnᥱrᥲᥣ mᥱnᥙ
┊ ④◦➛doᥕnᥣoᥲd mᥱnᥙ
┊ ⑤◦➛ᥙsᥱ mᥱnᥙ
┊ ⑥◦➛mod mᥱnᥙ
┊ ⑦◦➛fᥙn mᥱnᥙ
┊ ⑧◦➛books mᥱnᥙ
┊ ⑨◦➛sᥱᥲᥴh mᥱnᥙ
┊ ⑩◦➛groᥙρ mᥱnᥙ
┊ ⑪◦➛ᥴontroᥣ mᥱnᥙ
┊___________________________
┊ʀᴇᴘʟʏ ʜɪ ᴡɪᴛʜ *ɴᴀᴍᴇ* ʟɪᴋᴇ *ᴀɪ-ᴍᴇɴᴜ*
╰┬──────────⊷⳹
┌┤🌇 *hᥲᥣᥣo fᥲmιᥣყ ${greeting}*
┊╰
╰──────────────────⊷`;

  // List of image URLs
  const njabulox = [
    "",
    "https://files.catbox.moe/xjeyjh.jpg",
    "https://files.catbox.moe/mh36c7.jpg",
    "https://files.catbox.moe/u6v5ir.jpg",
    "https://files.catbox.moe/bnb3vx.jpg"
  ];

  // Select a random image file
  const randomNjabulourl = njabulox[Math.floor(Math.random() * njabulox.length)];

  const extraImages1 = [
    "",
    "https://files.catbox.moe/bnb3vx.jpg",
    "https://files.catbox.moe/xjeyjh.jpg"
  ];

  const extraImages2 = [
    "https://files.catbox.moe/mh36c7.jpg",
    "https://files.catbox.moe/u6v5ir.jpg",
    "https://files.catbox.moe/mh36c7.jpg"
  ];

  // Randomly select which menu to show
  const isOriginalMenu = Math.random() > 0.5; // 50% chance for either menu
  let mediaUrl, thumbnail, renderType;
  if (isOriginalMenu) {
    mediaUrl = mybotpic(); // Use bot’s original picture
    thumbnail = extraImages1[Math.floor(Math.random() * extraImages1.length)];
    renderType = "renderLargerThumbnail";
  } else {
    mediaUrl = extraImages2[Math.floor(Math.random() * extraImages2.length)];
    thumbnail = mediaUrl; // Use the same image as media
    renderType = "renderSmallThumbnail";
  }

  try {
    const senderName = nomAuteurMessage || ms.sender;
    await zk.sendMessage(dest, {
      image: { url: randomNjabulourl },
      caption: infoMsg,
      contextInfo: {
        mentionedJid: [ms.sender],
        externalAdReply: {
          title: "📝messages menu cmd",
          mediaType: 1,
          previewType: 0,
          thumbnailUrl: randomNjabulourl,
          sourceUrl: "https://www.instagram.com/njabulojb871",
          renderLargerThumbnail: false,
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error("Menu error: ", error);
    repondre("🥵🥵 Menu error: " + error);
  }

  // List of audio URLs
  const audioUrls = [
    "https://files.catbox.moe/6x0rb7.mp3",
    "https://files.catbox.moe/uz4apw.mp3",
    "https://files.catbox.moe/cup6rc.mp3"
  ];

  // Select a random audio file
  const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];

  try {
    await zk.sendMessage(dest, {
      audio: { url: randomAudioUrl },
      mimetype: 'audio/mpeg',
      ptt: true, // Send as a voice note
      contextInfo: {
        externalAdReply: {
          title: "njᥲbᥙᥣo jb",
          body: "🍁",
          mediaType: 1,
          thumbnailUrl: randomAudioUrl,
          sourceUrl: "https://www.instagram.com/njabulojb871",
          showAdAttribution: false,
          [renderType]: true, // Apply correct thumbnail size
        }
      }
    }, { quoted: ms });
  } catch (e) {
    console.log("🥵🥵 Error sending audio: " + e);
    repondre("🥵🥵 Error sending audio: " + e);
  }
});

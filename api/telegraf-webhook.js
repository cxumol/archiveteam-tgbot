process.env.NTBA_FIX_319 = 1;
const filesize = require('filesize');
const fetch = require('node-fetch');
// import fetch from "node-fetch";
// import filesize from "filesize";

async function getWorriorInfo(trackerSite, userName) {
//   console.log(trackerSite, userName)
  const response = await fetch("https://legacy-api.arpa.li/reddit/stats.json");
  const stats = await response.json();
  const downloadersOrder = stats.downloaders.sort(function(a, b) {
    return stats.downloader_bytes[b] - stats.downloader_bytes[a];
  });
  const userRank = downloadersOrder.indexOf(userName);
  const userBytes = stats.downloader_bytes[userName];
  const userCounts = stats.downloader_count[userName];
  return {
    rank: userRank,
    size: filesize(userBytes, { standard: "iec", unix: false }),
    counts: userCounts
  };
}

// const result = await getWorriorInfo("reddit", "cxumol");
// console.log(result);

// const { Telegraf } = require('telegraf');
// import { Telegraf } from "telegraf";
const TelegramBot = require("node-telegram-bot-api");
const { BOT_TOKEN , WEBHOOKPATH } = process.env;
const PORT = process.env.PORT || 3000;
// console.log("PORT", PORT)






module.exports = async (request, response) => {

  const bot = new TelegramBot(BOT_TOKEN);

  try {
    const { body } = request;
    if (body.message) {
      const {
        chat: { id },
        text,
      } = body.message;
      let myMatch = text.matchAll( /.*get_(.+?)_(.+)/g );
      if (myMatch) {
        console.log( "myMatch", myMatch)
        const info = await getWorriorInfo(myMatch[1], myMatch[2]);
        console.log("info",info)
        const infoStr = JSON.stringify(info, null, ' ');
        const message = `✅\n*${infoStr}*`;
        await bot.sendMessage(id, message, { parse_mode: "Markdown" });
      }else{
        await bot.sendMessage(id, "press /help to find out usage", { parse_mode: "Markdown" });
      }
      
      
    }
  } catch (error) {
    // If there was an error sending our message then we
    // can log it into the Vercel console
    console.error("Error sending message");
    console.log(error.toString());
  }

  response.status(200).send(`OK234`);
}
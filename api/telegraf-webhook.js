process.env.NTBA_FIX_319 = 1;
const filesize = require('filesize');
const fetch = require('node-fetch');
// import fetch from "node-fetch";
// import filesize from "filesize";

async function getWorriorInfo(trackerSite, userName) {
//   console.log(trackerSite, userName)
  const response = await fetch(`https://legacy-api.arpa.li/${trackerSite}/stats.json`);
  const stats = await response.json();
  const downloadersOrder = stats.downloaders.sort(function(a, b) {
    return stats.downloader_bytes[b] - stats.downloader_bytes[a];
  });
  const userRank = downloadersOrder.indexOf(userName) +1; // TOP 1, not TOP 0
  const userBytes = stats.downloader_bytes[userName];
  const userCounts = stats.downloader_count[userName];
  return {
    id: userName,
    ArchiveTeamTracker: trackerSite,
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
      let myMatch = text.match( /.*get_(.+?)_(.+)/ );
      if (myMatch) {
        try{
          const info = await getWorriorInfo(myMatch[1], myMatch[2]);
          const message = `✅\n*${JSON.stringify(info,null,2)}*`;
          await bot.sendMessage(id, message, { parse_mode: "Markdown" });
        }catch (err){
          // const errMsg = "something wrong, check if your info is correct";
          const errMsg = err.toString()
          await bot.sendMessage(id, errMsg, { parse_mode: "Markdown" });
        }
      }else if (text == "/help") {
        await bot.sendMessage(id, "send <code>/get_someProject_someNickName</code>\nFor example, /get_reddit_fuzzy80211", { parse_mode: "HTML" });
        // await bot.sendMessage(id, "test3 /get_reddit_fuzzy80211 /get\\*reddit\\*fuzzy80211 get*reddit*fuzzy80211", { parse_mode: "MarkdownV2" });
      }
      }else{
        await bot.sendMessage(id, "press /help to find out usage", { parse_mode: "Markdown" });
      }
  } catch (error) {
    // If there was an error sending our message then we
    // can log it into the Vercel console
    console.error("Error sending message");
    console.log(error.toString());
  }

  response.status(200).send(`OK234`);
}

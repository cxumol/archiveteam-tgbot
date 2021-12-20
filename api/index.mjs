// const { filesize } = require('filesize');
// const { fetch } = require('node-fetch');
import fetch from "node-fetch";
import filesize from "filesize";

async function getWorriorInfo(trackerSite, userName) {
  console.log(trackerSite, userName  )
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
import { Telegraf } from "telegraf";
const { BOT_TOKEN , WEBHOOKPATH } = process.env;
const PORT = process.env.PORT || 3000;
// console.log("PORT", PORT)




// bot.telegram.setWebhook(`https://archiveteam-tgbot.vercel.app/${WEBHOOKPATH}`);
// bot.startWebhook(`${WEBHOOKPATH}`, null, PORT)

export default async function handler(request, response) {

  const bot = new Telegraf(BOT_TOKEN);

  bot.hears(/.*get_(.+?)_(.+)/g, async ctx => {
    console.log(ctx.match[1], ctx.match[2]);
    const info = await getWorriorInfo(ctx.match[1], ctx.match[2]);
    console.log(info);
    ctx.reply(info);
  });

  bot.launch({
    webhook: {
      domain: `https://archiveteam-tgbot.vercel.app`,
      port: PORT
    }
  })

  response.status(200).send(`OK`);
}




// module.exports = (req, res) => {
//   const { name = 'Telegram' } = req.query;
//   res.send(`Hello ${name}!`);
// };

// export default function handler(req, res) {
//   res.status(200).json({
//     body: req.body,
//     query: req.query,
//     cookies: req.cookies,
//   });
// }
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

import { Telegraf } from "telegraf";
const { BOT_TOKEN, PROJECT_NAME, PORT } = process.env;

const bot = new Telegraf(BOT_TOKEN);

bot.hears(/.*get_(.+?)_(.+)/g, async ctx => {
  const info = await getWorriorInfo(ctx.match[1], ctx.match[2]);
  ctx.reply(info);
});


bot.launch({
  webhook: {
    domain: `https://archiveteam-tgbot.cxu.vercel.app`,
    port: PORT
  }
})
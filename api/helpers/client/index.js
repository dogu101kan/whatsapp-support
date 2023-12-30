
const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { saveMessage } = require("../db");
const { emit } = require("../socket");

let client;


const initialize = () => {

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: "client-one"
    }),
    puppeteer: {
      headless: true,
    }
  });
  

  client.initialize();

  client.on("qr", (qr) => {
    emit("wp_qr", qr);
    qrcode.generate(qr, {
      small: true,
    });
  });

  client.on("authenticated", (session) => {
    console.log("AUTHENTICATED", session);
    emit("wp_qr", null)
  });

  client.on("auth_failure", (msg) => {
    console.error("AUTHENTICATION FAILURE", msg);
  });

  client.on("ready", () => {
    console.log("READY");
  });
  
  client.on("message", async (message) => {
    try {
      console.log(message)
      console.log(await message.getContact().pushname);
      const newMessage = await saveMessage(message, client);
      emit("wp_message", newMessage);
    } catch (error) {
      console.log(error);
    }
  });

  client.on("disconnected", (e) => {
    // process exit yapılacak pm2 otomatik restart edecek zaten
    console.log("disconnected", e);
    const process = require('process');
    process.exit();
  });

  return client;
};

const getClient = () => {
  try {
    if (!client) {
      initialize();
    }
    return client;
  } catch (error) {
    client.initialize();
  }
};

module.exports = {
  initialize,
  getClient,
};

// let sessionPath = process.cwd() + "\\.wwebjs_auth\\session-client-one";
// try {
//     console.log(sessionPath);
//     fs.chmodSync(sessionPath, 0o777);
//     if (fs.existsSync(sessionPath)) {
//         setTimeout(() => {
//             fs.unlink(sessionPath, (err) => {
//                 if (err) {
//                     console.log(err);
//                 }
//                 console.log("silindi");
//             });
//         }, 1000); // Silmeden önce 1 saniye bekleme
//     }
// } catch (error) {
//     console.log(error);
// }

require("dotenv").config();
const coolsms = require("coolsms-node-sdk");

async function printTokenResult(phone, token) {
  if (!process.env.SMS_API_KEY || !process.env.SMS_API_SECRET) {
    console.log(`[TEST MODE] 인증번호: ${token} (실제 전송 없음)`);
    return;
  }

  const mysms = coolsms.default;
  const messageService = new mysms(
    process.env.SMS_API_KEY,
    process.env.SMS_API_SECRET
  );

  const result = await messageService.sendOne({
    to: phone,
    from: process.env.SMS_SENDER,
    text: `[PANATA]\n요청하신 인증번호는 [${token}]입니다.`,
  });

  console.log(result);
}

module.exports = { printTokenResult };

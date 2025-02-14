const coolsms = require("coolsms-node-sdk");

async function printTokenResult(phone, token) {
  const mysms = coolsms.default;
  const messageService = new mysms(
    "NCSAUWWQH30RY84J",
    "EWXKIAEMKR8XGWKFBIJT5CV7CMWD0MCM",
  );
  const result = await messageService.sendOne({
    to: `${phone}`,
    from: "01023002175",
    text: `[PANATA]\n요청하신 인증번호는 [${token}]입니다.`,
  });

  console.log(result);
}

module.exports = {
  printTokenResult,
};

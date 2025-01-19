document.getElementById("send-code-btn").addEventListener("click", async () => {
  const phone = document.getElementById("user_phone").value;

  if (!phone) {
    alert("전화번호를 입력하세요.");
    return;
  }

  const response = await fetch("/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });

  const result = await response.json();
  alert(result.message); // 인증번호 발송 결과 표시
});

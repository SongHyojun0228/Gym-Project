// 클릭했을 떄
document.querySelectorAll(".form-input").forEach((input) => {
  input.addEventListener("focus", () => {
    document.querySelector(`label[for="${input.id}"]`).style.color =
      "rgb(152, 41, 50)";
  });
  input.addEventListener("blur", () => {
    document.querySelector(`label[for="${input.id}"]`).style.color = "black";
  });
});

const allAgreeCheckbox = document.getElementById("all-agree");
const agreeItems = document.querySelectorAll(".agree-item");

allAgreeCheckbox.addEventListener("change", (event) => {
  const isChecked = event.target.checked;

  agreeItems.forEach((checkbox) => {
    checkbox.checked = isChecked;
  });
});

agreeItems.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const allChecked = Array.from(agreeItems).every((item) => item.checked);
    allAgreeCheckbox.checked = allChecked;
  });
});
document.querySelectorAll(".itemts").forEach((input) => {
  input.addEventListener("focus", () => {
    document.querySelector(`label[for="${input.id}"]`).style.color =
      "rgb(152, 41, 50)";
  });

  input.addEventListener("blur", () => {
    document.querySelector(`label[for="${input.id}"]`).style.color = "black";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const imgContainer = document.getElementById("img-container");
  const imgInput = document.getElementById("img-input");

  imgContainer.addEventListener("click", () => {
    imgInput.click();
  });
});

function previewImage(event) {
  const preview = document.getElementById("profile-img-preview");
  const saveButton = document.getElementById("save-profile-btn");
  const changeProfileLink = document.getElementById("change-profile-img");
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      preview.src = reader.result;
    };
    reader.readAsDataURL(file);
    saveButton.style.display = "block";
    changeProfileLink.style.display = "none";
  } else {
    saveButton.style.display = "none";
    changeProfileLink.style.display = "block";
  }
}

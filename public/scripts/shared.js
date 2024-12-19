document.getElementById('logo-div').addEventListener('mouseover', function() {
    document.getElementById('logo').style.color = "rgb(255,255,255)";
});

document.getElementById('logo-div').addEventListener('mouseout', function() {
    document.getElementById('logo').style.color = "";
});

// aside
document.addEventListener("DOMContentLoaded", () => {
    const dumbbellImg = document.querySelector("#aside-navigation img");
    const asideContainer = document.getElementById("aside-container");
    const overlay = document.createElement("div");
    overlay.id = "overlay";
    document.body.appendChild(overlay);

    const header = document.querySelector("header"); 

    dumbbellImg.addEventListener("click", () => {
        asideContainer.classList.add("active");
        overlay.classList.add("active");
        header.classList.add("blurred"); 
    });

    overlay.addEventListener("click", () => {
        asideContainer.classList.remove("active");
        overlay.classList.remove("active");
        header.classList.remove("blurred"); 
    });
});


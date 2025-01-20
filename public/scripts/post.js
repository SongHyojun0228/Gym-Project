document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".toggle-btn");
  
    buttons.forEach((button) => {
      const postId = button.getAttribute("data-post-id");
      const contentElement = document.querySelector(`.content[data-post-id="${postId}"]`);
  
      // 초기 상태 강제 설정
      contentElement.style.webkitLineClamp = 4;
      contentElement.style.overflow = "hidden";
  
      button.addEventListener("click", () => {
        const isCollapsed = contentElement.style.webkitLineClamp === "4" || !contentElement.style.webkitLineClamp;
  
        if (isCollapsed) {
          contentElement.style.webkitLineClamp = "none"; // 모든 줄 표시
          contentElement.style.overflow = "visible"; // 넘침 해제
          button.textContent = "간략히 보기";
        } else {
          contentElement.style.webkitLineClamp = 4; // 4줄 제한
          contentElement.style.overflow = "hidden";
          button.textContent = "자세히 보기";
        }
      });
    });
  });
  
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".toggle-btn");

  buttons.forEach((button) => {
    const postId = button.getAttribute("data-post-id");
    const contentElement = document.querySelector(
      `.content[data-post-id="${postId}"], #post-comment`,
    );

    // 콘텐츠가 존재하지 않으면 넘어감
    if (!contentElement) return;

    // 초기 상태 강제 설정
    contentElement.style.webkitLineClamp = 4;
    contentElement.style.overflow = "hidden";

    button.addEventListener("click", () => {
      const isCollapsed =
        contentElement.style.webkitLineClamp === "4" ||
        !contentElement.style.webkitLineClamp;

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

  document.querySelectorAll(".like-icon").forEach((likeIcon) => {
    likeIcon.addEventListener("click", async () => {
      const postContainer = likeIcon.closest(".post-detail-container");
      const postId = postContainer.dataset.postId;
      const likeCountElement = postContainer.querySelector(".number-of-likes");

      try {
        const response = await fetch(`/community/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 세션 쿠키를 포함하도록 설정
        });

        if (response.status === 401) {
          alert("로그인이 필요합니다.");
          return;
        }

        if (!response.ok) throw new Error("좋아요 업데이트 실패");

        const data = await response.json();
        likeCountElement.textContent = data.like;

        // 아이콘 변경
        likeIcon.src = data.isLiked ? "/images/click-like.png" : "/images/basic-like.png";
      } catch (error) {
        console.error("좋아요 처리 오류:", error);
      }
    });
  });
});

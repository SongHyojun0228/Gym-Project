document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-comment");

  const commentInput = document.getElementById("comment");
  const commentList = document.getElementById("comment-list");

  if (!form) {
    console.error("❌ form-comment 요소를 찾을 수 없습니다.");
    return;
  }

  const postId = form.dataset.postId;
  if (!postId) {
    console.error("❌ postId가 정의되지 않았습니다.");
    return;
  }

  // 댓글 작성 처리
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const comment = commentInput.value.trim();

    if (!comment) {
      alert("댓글을 입력하세요.");
      return;
    }

    try {
      const response = await fetch(`/community/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        alert(responseData.error);
        if (responseData.redirect) window.location.href = responseData.redirect;
        return;
      }

      const responseData = await response.json();
      console.log("📢 댓글 응답 데이터:", responseData);  // ✅ authorProfile이 있는지 확인

      const li = document.createElement("li");
      li.className = "comment-li";
      li.innerHTML = `
        <li class="comment-item">
          <div class="comment-author-profile">
            <img src="${responseData.authorProfile}" alt="프로필 이미지">
          </div>
          <div>
            <p class="user-info">${responseData.author} <span class="comment-time">${responseData.timeAgo}</span></p>
            <p class="comment">${responseData.comment}</p>
          </div>
        </li>

        <div class="comment-detail-container">
          <div class="reply-comment-line-container">
            <p class="reply-comment-line" data-comment-id="${responseData._id}">답글 달기</p>
          </div>
        </div>
        
        <form class="form-reply-comment hidden" method="POST" class="form-reply-comment hidden"  data-comment-id="${responseData._id}">
          <input type="text" class="reply-comment" name="replyComment" placeholder="답글 추가..." />
          <button>작성</button>
        </form>
      `;

      commentList.prepend(li);
      commentInput.value = "";
    } catch (error) {
      alert("댓글 작성 중 오류가 발생했습니다.");
      console.error(error);
    }
  });

  // 답글 버튼 클릭 시 입력 폼 표시
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("reply-comment-line")) {
      const commentId = event.target.dataset.commentId;
      const replyForm = document.querySelector(`.form-reply-comment[data-comment-id="${commentId}"]`);
      if (replyForm) replyForm.classList.toggle("hidden");
    }
  });

  // 답글 작성 처리
  document.addEventListener("submit", async (event) => {
    if (event.target.classList.contains("form-reply-comment")) {
      event.preventDefault();

      const replyCommentInput = event.target.querySelector(".reply-comment");
      const replyComment = replyCommentInput.value.trim();
      const commentId = event.target.dataset.commentId;

      if (!replyComment) {
        alert("답글을 입력하세요.");
        return;
      }

      try {
        const response = await fetch(`/community/comment/${commentId}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replyComment }),
        });

        if (!response.ok) {
          const responseData = await response.json();
          alert(responseData.error);
          if (responseData.redirect) window.location.href = responseData.redirect;
          return;
        }

        const responseData = await response.json();

        const replyList = document.getElementById(`reply-list-${commentId}`);
        const li = document.createElement("li");
        li.className = "reply-item";
        li.innerHTML = `
          <div class="reply-author-profile">
            <img src="${responseData.authorProfile}" alt="프로필 이미지">
          </div>
          <div>
            <p class="user-info">${responseData.author} <span class="reply-time">${responseData.timeAgo}</span></p>
            <p class="reply-comment">${responseData.comment}</p>
          </div>
        `;

        replyList.prepend(li);
        replyCommentInput.value = "";
        replyList.classList.remove("hidden");
      } catch (error) {
        alert(error.message);
      }
    }
  });
});

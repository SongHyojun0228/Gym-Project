document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-comment");
  const commentInput = document.getElementById("comment");
  const commentList = document.getElementById("comment-list");

  // 댓글 작성 처리
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const comment = commentInput.value.trim();
    const postId = form.dataset.postId;

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
        throw new Error("댓글 작성 중 오류가 발생했습니다.");
      }

      const newComment = await response.json();
      if (!newComment._id) {
        throw new Error("서버에서 올바른 응답을 받지 못했습니다.");
      }

      const li = document.createElement("li");
      li.className = "comment-li";
      li.innerHTML = `
        <li class="comment-item">
          <div class="comment-author-profile">
            <img src="${newComment.authorProfile}" alt="프로필 이미지">
          </div>
          <div>
            <p class="user-info">${newComment.author} <span class="comment-time">${newComment.timeAgo}</span></p>
            <p class="comment">${newComment.comment}</p>
          </div>
        </li>
        <div class="comment-detail-container">
          <div class="comment-icon-container">
            <img src="/images/basic-like.png" class="comment-like-icon" alt="좋아요">
          </div>
          <div class="comment-number-of-likes-container">
            <p class="comment-number-of-likes">${newComment.like || 0}</p>
          </div>
          <div class="comment-icon-container">
            <img src="/images/basic-like.png" class="comment-hate-icon" alt="싫어요">
          </div>
          <div class="reply-comment-line-container">
            <p class="reply-comment-line" data-comment-id="${newComment._id}">답글</p>
          </div>
        </div>

        <!-- 답글 입력 폼 -->
        <form class="form-reply-comment hidden" data-comment-id="${newComment._id}">
          <input type="text" class="reply-comment" name="replyComment" placeholder="답글 추가..." />
          <button>작성</button>
        </form>

        <!-- 답글 리스트 -->
        <ul class="reply-list hidden" id="reply-list-${newComment._id}"></ul>
      `;

      commentList.appendChild(li);
      commentInput.value = "";
    } catch (error) {
      alert(error.message);
    }
  });

  // 답글 버튼 클릭 시 입력 폼 표시
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("reply-comment-line")) {
      const commentId = event.target.dataset.commentId;
      const replyForm = document.querySelector(
        `.form-reply-comment[data-comment-id="${commentId}"]`,
      );

      if (replyForm) {
        replyForm.classList.toggle("hidden");
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("reply-show-btn")) {
      const commentId = event.target.dataset.commentId;
      const replyList = document.getElementById(`reply-list-${commentId}`);

      if (replyList) {
        replyList.classList.toggle("hidden");
      }
    }
  });

  // 답글 작성 후 즉시 반영
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
          throw new Error("답글 등록 중 오류가 발생했습니다.");
        }

        const newReply = await response.json();
        if (!newReply._id) {
          throw new Error("서버에서 올바른 응답을 받지 못했습니다.");
        }

        const replyList = document.getElementById(`reply-list-${commentId}`);
        const li = document.createElement("li");
        li.className = "reply-item";
        li.innerHTML = `
          <div class="reply-author-profile">
            <img src="${newReply.authorProfile}" alt="프로필 이미지">
          </div>
          <div>
            <p class="user-info">${newReply.author} <span class="reply-time">${newReply.timeAgo}</span></p>
            <p class="reply-comment">${newReply.comment}</p>
          </div>
        `;

        replyList.appendChild(li);
        replyCommentInput.value = "";
        replyList.classList.remove("hidden");
      } catch (error) {
        alert(error.message);
      }
    }
  });
});

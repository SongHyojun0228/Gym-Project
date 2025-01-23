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

    const response = await fetch(`/community/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });

    const newComment = await response.json();
    const li = document.createElement("li");
    li.className = "comment-item";
    li.innerHTML = `
      <p class="user-info">${newComment.author} <span class="comment-time">${newComment.timeAgo}</span></p>
      <p class="comment">${newComment.comment}</p>

      <div class="comment-detail-container">
        <div class="comment-icon-container">
          <img src="/images/basic-like.png" class="comment-like-icon" alt="like">
        </div>

        <div class="comment-number-of-likes-container">
          <p class="comment-number-of-likes">${newComment.like || 0}</p>
        </div>

        <div class="comment-icon-container">
          <img src="/images/basic-like.png" class="comment-hate-icon" alt="hate">
        </div>

        <div class="reply-comment-line-container">
          <p class="reply-comment-line" data-comment-id="${newComment._id}">답글</p>
        </div>
      </div>

      <form
        action="/community/${newComment.postId}/reply-comment"
        method="POST"
        class="form-reply-comment hidden"
        data-comment-id="${newComment._id}">
        <input type="text" class="reply-comment" name="reply-comment" placeholder="답글 추가..." />
        <button>작성</button>
      </form>
    `;
    commentList.appendChild(li);
    commentInput.value = "";
  });

  // 답글 폼 보기
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("reply-comment-line")) {
      const commentId = event.target.getAttribute("data-comment-id");
      const replyForm = document.querySelector(
        `.form-reply-comment[data-comment-id="${commentId}"]`
      );

      if (replyForm) {
        replyForm.classList.toggle("hidden");
      }
    }
  });

  // 답글 보기 
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("reply-show-btn")) {

      const commentId = event.target.closest(".reply-show-btn").getAttribute("data-comment-id");
      const replyList = document.getElementById(`reply-list-${commentId}`);
  
      if (replyList) {
        replyList.classList.toggle("hidden");
  
        if (replyList.classList.contains("hidden")) {
          event.target.textContent = `답글 ${replyCount}개`;
        } else {
          const replyCount = replyList.querySelectorAll(".reply-item").length;
          event.target.textContent = `답글 ${replyCount}개`;
        }
      }
    }
  });
  

  // 답글 작성 처리
  document.addEventListener("submit", async (event) => {
    if (event.target.classList.contains("form-reply-comment")) {
      event.preventDefault(); // 기본 동작 막기
      console.log("답글 폼 제출 이벤트 감지됨"); // 디버깅용 로그
      
      const replyCommentInput = event.target.querySelector(".reply-comment");
      const replyComment = replyCommentInput.value.trim();
      const commentId = event.target.dataset.commentId;
  
      if (!replyComment) {
        alert("답글을 입력하세요.");
        return;
      }
  
      const response = await fetch(`/community/comment/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyComment }),
      });
  
      if (response.ok) {
        const newReply = await response.json();
        const replyList = document.getElementById(`reply-list-${commentId}`);
        const li = document.createElement("li");
        li.className = "reply-item";
        li.innerHTML = `
          <p class="user-info">${newReply.author} <span class="reply-time">${newReply.timeAgo}</span></p>
          <p class="reply-comment">${newReply.comment}</p>
        `;
        replyList.appendChild(li);
        replyCommentInput.value = "";
      } else {
        const error = await response.json();
        alert(error.error || "답글 등록 중 오류가 발생했습니다.");
      }
    }
  });
});

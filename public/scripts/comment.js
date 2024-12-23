document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-comment");
    const commentInput = document.getElementById("comment");
    const commentList = document.getElementById("comment-list");
  
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
        <p class="comment">${newComment.comment}</p>
        <p class="user-info">${newComment.author} | ${newComment.timeAgo}</p>
      `;
      commentList.appendChild(li);
      commentInput.value = "";
    });
  });
  
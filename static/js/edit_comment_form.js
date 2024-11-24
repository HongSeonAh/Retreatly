document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");
  const editCommentForm = document.getElementById("editCommentForm");
  const contentInput = document.getElementById("content");
  const commentId = document.getElementById("commentId").value;
  const messageElement = document.getElementById("editCommentMessage");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  editCommentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = contentInput.value.trim();

    try {
      const response = await fetch(`/api/comment/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("답변이 성공적으로 수정되었습니다!");
        window.location.href = `/reviews/house/${reviewId}`;
      } else {
        messageElement.style.color = "red";
        messageElement.textContent = `오류: ${data.message}`;
      }
    } catch (error) {
      console.error("답변 수정 오류:", error.message);
      alert("답변 수정 중 오류가 발생했습니다.");
    }
  });
});

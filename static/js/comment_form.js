document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");
  const commentForm = document.getElementById("commentForm");
  const contentInput = document.getElementById("content");
  const reviewId = document.getElementById("reviewId").value;
  const messageElement = document.getElementById("commentMessage");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = contentInput.value.trim();

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ review_id: reviewId, content }),
      });

      const data = await response.json();

      if (response.ok) {
        messageElement.style.color = "green";
        messageElement.textContent = "답변이 작성되었습니다!";
        contentInput.value = ""; // Clear the form
      } else {
        messageElement.style.color = "red";
        messageElement.textContent = `오류: ${data.message}`;
      }
    } catch (error) {
      console.error("답변 작성 오류:", error.message);
      alert("답변 작성 중 오류가 발생했습니다.");
    }
  });
});

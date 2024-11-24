document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");
  const reviewId = document.getElementById("reviewId").value;
  const titleInput = document.getElementById("title");
  const contentInput = document.getElementById("content");
  const ratingInput = document.getElementById("rating");
  const messageElement = document.getElementById("message");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  const editReviewForm = document.getElementById("editReviewForm");

  editReviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const rating = parseInt(ratingInput.value, 10);

    try {
      const response = await fetch(`/api/review/${reviewId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          rating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        messageElement.style.color = "green";
        messageElement.textContent = "리뷰가 성공적으로 수정되었습니다!";
        setTimeout(() => {
          window.location.href = `/guest-reviews`;
        }, 2000);
      } else {
        messageElement.style.color = "red";
        messageElement.textContent = `오류: ${data.message}`;
      }
    } catch (error) {
      console.error("리뷰 수정 오류:", error.message);
      alert("리뷰 수정 중 오류가 발생했습니다.");
    }
  });
});

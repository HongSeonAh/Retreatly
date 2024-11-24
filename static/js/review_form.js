document.addEventListener("DOMContentLoaded", async () => {
  const apiUrl = "http://localhost:5000"; // API URL
  const token = localStorage.getItem("jwt_token");

  // 토큰이 없으면 로그인 페이지로 리디렉션
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
    return;
  }

  const reviewForm = document.getElementById("reviewForm");

  if (!reviewForm) {
    console.error("리뷰 폼이 없습니다.");
    return;
  }

  // 리뷰 폼 제출 이벤트 처리
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    const houseId = document.getElementById("houseId").value;
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const rating = document.getElementById("rating").value;

    try {
      const response = await fetch(`${apiUrl}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // JWT 토큰 포함
        },
        body: JSON.stringify({
          house_id: houseId,
          title: title,
          content: content,
          rating: parseInt(rating, 10),
        }),
      });

      const result = await response.json();
      const messageElement = document.getElementById("reviewMessage");

      if (response.ok) {
        alert("리뷰가 성공적으로 등록되었습니다!");
        window.location.href = `/reviews/house/${houseId}`;
      } else {
        messageElement.style.color = "red";
        messageElement.textContent = `리뷰 등록 실패: ${result.message}`;
      }
    } catch (error) {
      console.error("리뷰 등록 중 오류 발생:", error);
      alert("리뷰 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  });
});

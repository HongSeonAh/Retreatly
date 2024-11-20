const apiUrl = "http://localhost:5000"; // API URL

// 페이지가 로드될 때 JWT 토큰이 있는지 확인
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");

  // 토큰이 없으면 로그인 페이지로 리디렉션
  if (!token) {
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
  }
});

// 리뷰 등록 요청
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // 기본 폼 제출 동작 방지

  const houseId = document.getElementById("houseId").value;
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const rating = document.getElementById("rating").value;

  // JWT 토큰 가져오기 (로컬 스토리지에서 예시)
  const token = localStorage.getItem("accessToken");

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
      messageElement.style.color = "green";
      messageElement.textContent = "리뷰가 성공적으로 등록되었습니다!";
      document.getElementById("reviewForm").reset(); // 폼 초기화
    } else {
      messageElement.style.color = "red";
      messageElement.textContent = `리뷰 등록 실패: ${result.message}`;
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("리뷰 등록 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
});

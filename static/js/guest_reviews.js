document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  const reviewTableBody = document.getElementById("reviewTableBody");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
    return;
  }

  try {
    // 게스트가 작성한 리뷰 목록을 불러오는 API 호출
    const response = await fetch("/api/my-reviews", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const reviews = await response.json();

    // 리뷰 목록을 테이블에 추가
    if (reviews.length > 0) {
      reviews.forEach((review) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${review.house_name}</td>
            <td>${review.title}</td>
            <td>${review.rating}</td>
            <td>${review.created_at}</td>
          `;
        reviewTableBody.appendChild(row);
      });
    } else {
      reviewTableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center;">리뷰가 없습니다.</td>
          </tr>
        `;
    }
  } catch (error) {
    console.error("리뷰 목록 로드 오류:", error.message);
    reviewTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center;">리뷰 데이터를 가져오는 중 오류가 발생했습니다.</td>
        </tr>
      `;
  }
});

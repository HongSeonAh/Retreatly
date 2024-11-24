document.addEventListener("DOMContentLoaded", async () => {
  const houseId = window.location.pathname.split("/").pop(); // Extract house ID from URL
  const reviewTableBody = document.getElementById("reviewTableBody");
  const averageRatingElement = document.getElementById("averageRating");
  const writeReviewButton = document.getElementById("writeReviewButton");

  const token = localStorage.getItem("jwt_token");

  // JWT 토큰 체크
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  try {
    // Fetch reviews API
    const response = await fetch(`/api/reviews/${houseId}`);
    if (!response.ok) throw new Error("리뷰 데이터를 불러올 수 없습니다.");

    const data = await response.json();

    // Update total average rating
    averageRatingElement.textContent = data.average_rating;

    // Populate review table
    if (data.reviews && data.reviews.length > 0) {
      data.reviews.forEach((review) => {
        const row = document.createElement("tr");

        // Create a clickable title for each review
        const titleCell = document.createElement("td");
        const titleLink = document.createElement("a");
        titleLink.href = `/review/${review.review_id}`; // 링크를 리뷰 상세 페이지로 설정
        titleLink.textContent = review.title;
        titleCell.appendChild(titleLink);

        row.appendChild(titleCell);
        row.appendChild(document.createElement("td")).textContent =
          review.author;
        row.appendChild(document.createElement("td")).textContent =
          review.rating;

        reviewTableBody.appendChild(row);
      });
    } else {
      // No reviews found
      reviewTableBody.innerHTML = `
            <tr>
              <td colspan="3" style="text-align: center;">리뷰가 없습니다.</td>
            </tr>
          `;
    }

    // 리뷰 작성 버튼 표시 조건
    const userInfoResponse = await fetch(`/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userInfo = await userInfoResponse.json();
    if (userInfo.role === "guest") {
      writeReviewButton.style.display = "block";
      writeReviewButton.addEventListener("click", () => {
        window.location.href = `/review-form/${houseId}`;
      });
    }
  } catch (error) {
    console.error("리뷰 목록 로드 오류:", error.message);
    averageRatingElement.textContent = "오류";
    reviewTableBody.innerHTML = `
          <tr>
            <td colspan="3" style="text-align: center;">리뷰 데이터를 가져오는데 문제가 발생했습니다.</td>
          </tr>
        `;
  }
});

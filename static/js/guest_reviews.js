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
              <td><a href="/review/${review.review_id}">${review.house_name}</a></td>
              <td>${review.title}</td>
              <td>${review.rating}</td>
              <td>${review.created_at}</td>
              <td>
                <button class="edit-button" data-id="${review.review_id}">수정</button>
                <button class="delete-button" data-id="${review.review_id}">삭제</button>
              </td>
            `;
        reviewTableBody.appendChild(row);
      });

      // 수정 버튼 클릭 시 리뷰 수정 폼으로 이동
      const editButtons = document.querySelectorAll(".edit-button");
      editButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const reviewId = e.target.dataset.id;
          window.location.href = `/review-form/edit/${reviewId}`;
        });
      });

      // 삭제 버튼 클릭 시 리뷰 삭제
      const deleteButtons = document.querySelectorAll(".delete-button");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          const reviewId = e.target.dataset.id;
          try {
            const deleteResponse = await fetch(`/api/review/${reviewId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const data = await deleteResponse.json();

            if (deleteResponse.ok) {
              alert("리뷰가 삭제되었습니다.");
              window.location.reload();
            } else {
              alert(data.message);
            }
          } catch (error) {
            console.error("리뷰 삭제 오류:", error.message);
            alert("리뷰 삭제 중 오류가 발생했습니다.");
          }
        });
      });
    } else {
      reviewTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center;">리뷰가 없습니다.</td>
          </tr>
        `;
    }
  } catch (error) {
    console.error("리뷰 목록 로드 오류:", error.message);
    reviewTableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center;">리뷰 데이터를 가져오는 중 오류가 발생했습니다.</td>
          </tr>
        `;
  }
});

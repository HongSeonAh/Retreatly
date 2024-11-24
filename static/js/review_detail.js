document.addEventListener("DOMContentLoaded", async () => {
  const reviewId = window.location.pathname.split("/").pop(); // Extract review ID
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  try {
    // Fetch 리뷰 상세 데이터
    const reviewResponse = await fetch(`/api/review/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const reviewData = await reviewResponse.json();
    if (!reviewResponse.ok) throw new Error(reviewData.message);

    // Populate 리뷰 상세 데이터
    document.getElementById("reviewTitle").textContent = reviewData.title;
    document.getElementById("reviewAuthor").textContent = reviewData.author;
    document.getElementById("reviewRating").textContent = reviewData.rating;
    document.getElementById("reviewContent").textContent = reviewData.content;
    document.getElementById("reviewUpdatedAt").textContent =
      reviewData.updated_at;

    const commentList = document.getElementById("commentList");
    if (reviewData.comments.length > 0) {
      reviewData.comments.forEach((comment) => {
        const li = document.createElement("li");
        li.innerHTML = `
                <strong>${comment.host_name}:</strong> ${comment.content}
                <small>(${comment.created_at})</small>
              `;
        commentList.appendChild(li);
      });
    } else {
      commentList.innerHTML = "<li>댓글이 없습니다.</li>";
    }

    // Fetch 사용자 정보
    const userResponse = await fetch(`/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userResponse.json();
    if (!userResponse.ok) throw new Error(userData.message);

    // Check if user is host and enable actions accordingly
    if (
      userData.role === "host" &&
      reviewData.house_host_id === userData.host_id
    ) {
      const hostActions = document.getElementById("hostActions");
      hostActions.style.display = "block";

      // Disable "답변 작성" button if comment exists
      if (reviewData.has_comment) {
        document.getElementById("addCommentBtn").disabled = true;
        document.getElementById("addCommentBtn").textContent =
          "답변이 이미 작성되었습니다";
      }

      document.getElementById("addCommentBtn").addEventListener("click", () => {
        window.location.href = `/comment-form/${reviewId}`; // 답변 작성 폼으로 이동
      });

      if (reviewData.comments.length > 0) {
        document.getElementById("editCommentBtn").style.display =
          "inline-block";
        document
          .getElementById("editCommentBtn")
          .addEventListener("click", () => {
            const commentId = reviewData.comments[0].comment_id; // 첫 번째 댓글을 수정
            window.location.href = `/comment-form/edit/${commentId}`; // 답변 수정 폼으로 이동
          });

        document.getElementById("deleteCommentBtn").style.display =
          "inline-block";
        document
          .getElementById("deleteCommentBtn")
          .addEventListener("click", async () => {
            // Handle comment deletion
            try {
              const commentId = reviewData.comments[0].comment_id; // Assuming deleting first comment
              const deleteResponse = await fetch(`/api/comment/${commentId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const deleteData = await deleteResponse.json();
              if (deleteResponse.ok) {
                alert("답변이 삭제되었습니다.");
                window.location.reload(); // Refresh page to reflect the changes
              } else {
                alert(deleteData.message);
              }
            } catch (error) {
              console.error("Error deleting comment:", error);
              alert("답변 삭제 중 오류가 발생했습니다.");
            }
          });
      }
    }
  } catch (error) {
    console.error("리뷰 상세 로드 오류:", error.message);
    alert("리뷰 데이터를 불러오는 중 오류가 발생했습니다.");
  }
});

// Handle comment actions (현재는 삭제 기능만)
async function handleComment(action) {
  alert(`${action} 기능 구현 예정`);
}

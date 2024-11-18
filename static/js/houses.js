document
  .getElementById("registerHouseForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this); // FormData 객체 사용

    const token = localStorage.getItem("jwt_token"); // JWT 토큰 가져오기

    // API 호출
    fetch("/api/house", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰
        // Content-Type은 FormData를 사용할 때 설정하지 않아도 됩니다.
      },
      body: formData, // FormData 객체를 body로 설정
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "House created successfully with images.") {
          alert("숙소 등록 성공!");
          window.location.href = "/house"; // 성공 후 숙소 리스트 페이지로 리디렉션
        } else {
          alert("숙소 등록 실패: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("에러 발생!");
      });
  });

document
  .getElementById("editHouseForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this); // FormData 객체 사용
    const houseId = document.getElementById("house_id").value; // 수정할 숙소의 ID
    const token = localStorage.getItem("jwt_token"); // JWT 토큰 가져오기

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 수정 요청 보내기
    fetch(`/api/house/${houseId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰을 헤더에 포함
        // 'Content-Type'은 FormData를 사용할 때 설정하지 않아도 됩니다.
      },
      body: formData, // FormData 객체를 body로 설정
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "House updated successfully with images.") {
          alert("숙소 수정 성공!");
          window.location.href = "/house"; // 수정 후 숙소 리스트 페이지로 리디렉션
        } else {
          alert("숙소 수정 실패: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("에러 발생!");
      });
  });

document.getElementById("confirmDelete").addEventListener("click", function () {
  const houseId = document
    .getElementById("confirmDelete")
    .getAttribute("data-house-id"); // 삭제할 숙소의 ID

  // 삭제 요청 보내기
  fetch(`/api/house/${houseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`, // JWT 토큰
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "House deleted successfully.") {
        alert("숙소 삭제 성공!");
        window.location.href = "/house"; // 삭제 후 숙소 리스트 페이지로 리디렉션
      } else {
        alert("숙소 삭제 실패: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("에러 발생!");
    });
});

// 숙소 수정 페이지로 이동
function editHouse(houseId) {
  window.location.href = `/house/house_id=${houseId}/editform`; // 수정 페이지로 이동
}

// 숙소 삭제 확인 모달 띄우기
let houseToDelete = null;
function confirmDelete(houseId) {
  houseToDelete = houseId;
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "block";
}

// 삭제 취소
function closeDeleteModal() {
  const deleteModal = document.getElementById("deleteModal");
  deleteModal.style.display = "none";
}

// 숙소 삭제
document.getElementById("confirmDelete").addEventListener("click", function () {
  fetch(`/api/house/${houseToDelete}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "House deleted successfully.") {
        alert("숙소 삭제 성공!");
        window.location.reload(); // 삭제 후 페이지 새로 고침
        closeDeleteModal();
      } else {
        alert("숙소 삭제 실패: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error deleting house:", error);
      alert("숙소 삭제 중 오류가 발생했습니다.");
    });
});

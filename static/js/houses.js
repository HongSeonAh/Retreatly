document
  .getElementById("registerHouseForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // 폼에서 값 가져오기
    const data = {
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      description: document.getElementById("description").value,
      introduce: document.getElementById("introduce").value,
      max_people: document.getElementById("max_people").value,
      price_per_person: document.getElementById("price_per_person").value,
      price_per_day: document.getElementById("price_per_day").value,
    };

    // API 호출
    fetch("/api/house", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`, // JWT 토큰
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "House created successfully.") {
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

    const houseId = document.getElementById("house_id").value; // 수정할 숙소의 ID
    const data = {
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      description: document.getElementById("description").value,
      introduce: document.getElementById("introduce").value,
      max_people: document.getElementById("max_people").value,
      price_per_person: document.getElementById("price_per_person").value,
      price_per_day: document.getElementById("price_per_day").value,
    };

    // 수정 요청 보내기
    fetch(`/api/house/${houseId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`, // JWT 토큰
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "House updated successfully.") {
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

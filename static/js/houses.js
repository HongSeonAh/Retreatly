// 페이지가 로드될 때 JWT 토큰이 있는지 확인
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwt_token");

  // 토큰이 없으면 로그인 페이지로 리디렉션
  if (!token) {
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
  }
});

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

// 숙소 이름을 클릭하면 개별 페이지로 이동
function renderHouses(houses) {
  const tableBody = document.querySelector(".house-table tbody");
  tableBody.innerHTML = ""; // 기존 데이터 초기화

  houses.forEach((house) => {
    const row = document.createElement("tr");

    // 이미지 셀
    const imageCell = document.createElement("td");
    if (house.image) {
      const img = document.createElement("img");
      img.src = house.image;
      img.alt = "House Image";
      img.width = 150;
      imageCell.appendChild(img);
    } else {
      imageCell.textContent = "이미지 없음";
    }
    row.appendChild(imageCell);

    // 숙소 이름 셀 (링크 추가)
    const nameCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = `/house/${house.id}`;
    link.textContent = house.name;
    nameCell.appendChild(link);
    row.appendChild(nameCell);

    // 하루당 가격 셀
    const priceCell = document.createElement("td");
    priceCell.textContent = `${house.price_per_day.toLocaleString()} 원`;
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // 이미지 갤러리 슬라이드 기능 (선택 사항)
  let currentIndex = 0;
  const images = document.querySelectorAll(".image-gallery img");
  const totalImages = images.length;

  function showImage(index) {
    images.forEach((img, i) => {
      img.style.display = i === index ? "block" : "none";
    });
  }

  // 이미지 슬라이드쇼 제어
  setInterval(function () {
    currentIndex = (currentIndex + 1) % totalImages; // 인덱스를 순차적으로 변경
    showImage(currentIndex);
  }, 3000); // 3초마다 이미지 변경

  // 첫 번째 이미지 보이기
  showImage(currentIndex);
});

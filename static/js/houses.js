document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  try {
    // 숙소 데이터 가져오기
    const response = await fetch("/api/host-houses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("숙소 데이터를 불러오는데 실패했습니다.");
    }

    const { data } = await response.json();
    console.log(data);

    const tbody = document.querySelector("#table-body");
    if (!tbody) {
      console.error("#table-body 요소를 찾을 수 없습니다.");
      return;
    }

    if (data.length === 0) {
      // 숙소가 없는 경우
      tbody.innerHTML = `<tr>
        <td colspan="4">숙소가 없습니다.</td>
      </tr>`;
    } else {
      // 숙소 데이터를 테이블에 추가
      data.forEach((house) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="/house/${house.id}">${house.name}</a></td>
          <td>${house.address}</td>
          <td><button class="edit-button" data-id="${house.id}">수정하기</button></td>
          <td><button class="delete-button" data-id="${house.id}">삭제하기</button></td>
        `;
        tbody.appendChild(tr);
      });

      // 수정 버튼 이벤트 등록
      const editButtons = document.querySelectorAll(".edit-button");
      if (editButtons) {
        editButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const houseId = e.target.dataset.id;
            window.location.href = `/house/${houseId}/editform`;
          });
        });
      } else {
        console.error(".edit-button 요소를 찾을 수 없습니다.");
      }

      // 삭제 버튼 이벤트 등록
      const deleteButtons = document.querySelectorAll(".delete-button");
      if (deleteButtons) {
        deleteButtons.forEach((button) => {
          button.addEventListener("click", (e) => {
            const houseId = e.target.dataset.id;
            confirmDelete(houseId);
          });
        });
      } else {
        console.error(".delete-button 요소를 찾을 수 없습니다.");
      }

      // 등록하기 버튼 이벤트 리스너 추가
      const registerButton = document.getElementById("registerButton");
      if (registerButton) {
        registerButton.addEventListener("click", () => {
          window.location.href = "/house/registerform"; // 숙소 등록 폼으로 이동
        });
      } else {
        console.error("#registerButton 요소를 찾을 수 없습니다.");
      }
    }
  } catch (error) {
    console.error("Error loading houses:", error.message);
  }

  // 삭제 확인 모달
  let houseToDelete = null;

  function confirmDelete(houseId) {
    houseToDelete = houseId;
    const deleteModal = document.getElementById("deleteModal");
    if (deleteModal) {
      deleteModal.style.display = "block";
    } else {
      console.error("#deleteModal 요소를 찾을 수 없습니다.");
    }
  }

  function closeDeleteModal() {
    const deleteModal = document.getElementById("deleteModal");
    if (deleteModal) {
      deleteModal.style.display = "none";
    }
  }

  const confirmDeleteButton = document.getElementById("confirmDelete");
  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", async () => {
      try {
        const response = await fetch(`/api/house/${houseToDelete}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          alert("숙소 삭제 성공!");
          window.location.reload();
        } else {
          alert(`숙소 삭제 실패: ${data.message}`);
        }
      } catch (error) {
        console.error("Error deleting house:", error.message);
        alert("숙소 삭제 중 오류가 발생했습니다.");
      }
    });
  } else {
    console.error("#confirmDelete 요소를 찾을 수 없습니다.");
  }
});

// 숙소 등록
document
  .getElementById("registerHouseForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const token = localStorage.getItem("jwt_token");

    await fetch("/api/house", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(async (response) => response.json())
      .then((data) => {
        if (data.message === "House created successfully with images.") {
          alert("숙소 등록 성공!");
          window.location.href = "/host-houses";
        } else {
          alert("숙소 등록 실패: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("에러 발생!");
      });
  });

// 숙소 삭제
document.getElementById("confirmDelete").addEventListener("click", function () {
  const houseId = document
    .getElementById("confirmDelete")
    .getAttribute("data-house-id");

  fetch(`/api/house/${houseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "House deleted successfully.") {
        alert("숙소 삭제 성공!");
        window.location.href = "/house";
      } else {
        alert("숙소 삭제 실패: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("에러 발생!");
    });
});

// 숙소 목록 렌더링
function renderHouses(houses) {
  const tableBody = document.querySelector(".house-table tbody");
  tableBody.innerHTML = "";

  houses.forEach((house) => {
    const row = document.createElement("tr");

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

    const nameCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = `/house/${house.id}`;
    link.textContent = house.name;
    nameCell.appendChild(link);
    row.appendChild(nameCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = `${house.price_per_day.toLocaleString()} 원`;
    row.appendChild(priceCell);

    tableBody.appendChild(row);
  });
}

// 이미지 슬라이드
let currentIndex = 0;
const images = document.querySelectorAll(".image-gallery img");
const totalImages = images.length;

function showImage(index) {
  images.forEach((img, i) => {
    img.style.display = i === index ? "block" : "none";
  });
}

setInterval(function () {
  currentIndex = (currentIndex + 1) % totalImages;
  showImage(currentIndex);
}, 3000);

showImage(currentIndex);

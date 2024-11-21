document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");
  console.log(token);

  await fetch("/api/host-houses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (response) => {
      const { data } = await response.json();
      console.log(data);
      const tbody = document.querySelector("#table-body");

      if (data.length === 0) {
        // 숙소가 없습니다.
        tbody.innerHTML = `<tr>
          <td colspan="4">숙소가 없습니다.</td>
        </tr>`;
      } else {
        data.forEach((house) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${house.name}</td>
            <td>${house.address}</td>
            <td><button onclick="editHouse(${house.id})">수정하기</button></td>
            <td><button onclick="confirmDelete(${house.id})">삭제하기</button></td>
          `;
          tbody.appendChild(tr);
        });
      }
    })
    .catch((error) => {
      console.error("Token validation failed:", error);
      // window.location.href = "/login";
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
            window.location.href = "/house";
          } else {
            alert("숙소 등록 실패: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("에러 발생!");
        });
    });

  // 숙소 수정
  document
    .getElementById("editHouseForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      const token = localStorage.getItem("jwt_token");
      const houseId = document.getElementById("house_id").value;

      await fetch(`/api/house/${houseId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then(async (response) => response.json())
        .then((data) => {
          if (data.message === "House updated successfully with images.") {
            alert("숙소 수정 성공!");
            window.location.href = "/house";
          } else {
            alert("숙소 수정 실패: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("에러 발생!");
        });
    });

  // 숙소 삭제
  document
    .getElementById("confirmDelete")
    .addEventListener("click", function () {
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

  // 숙소 수정 페이지로 이동
  function editHouse(houseId) {
    window.location.href = `/house/house_id=${houseId}/editform`;
  }

  // 숙소 삭제 확인 모달
  let houseToDelete = null;
  function confirmDelete(houseId) {
    houseToDelete = houseId;
    const deleteModal = document.getElementById("deleteModal");
    deleteModal.style.display = "block";
  }

  function closeDeleteModal() {
    const deleteModal = document.getElementById("deleteModal");
    deleteModal.style.display = "none";
  }

  document
    .getElementById("confirmDelete")
    .addEventListener("click", function () {
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
            window.location.reload();
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
});

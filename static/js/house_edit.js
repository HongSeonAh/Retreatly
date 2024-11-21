// 숙소 수정
document
  .getElementById("editHouseForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const token = localStorage.getItem("jwt_token");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const houseId = document.getElementById("house_id").value;

    await fetch(`/api/house/${houseId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // JWT 토큰 추가
      },
      body: formData, // FormData 객체를 body로 설정
    })
      .then(async (response) => response.json())
      .then((data) => {
        if (data.message === "House updated successfully with images.") {
          alert("숙소 수정 성공!");
          window.location.href = "/host-houses";
        } else {
          alert("숙소 수정 실패: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("에러 발생!");
      });
  });

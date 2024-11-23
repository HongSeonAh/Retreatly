document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch("/api/reservation/host", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("예약 데이터를 불러올 수 없습니다.");
    }

    const data = await response.json();

    const tableBody = document.getElementById("reservationTableBody");
    tableBody.innerHTML = ""; // 기존 내용 초기화

    data.reservations.forEach((reservation) => {
      const row = document.createElement("tr");

      // 날짜를 'YYYY-MM-DD' 형식으로 변환
      const startDate = new Date(reservation.start_date)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(reservation.end_date)
        .toISOString()
        .split("T")[0];

      row.innerHTML = `
          <td><a href="/reservation/${reservation.id}">${reservation.house_name}</a></td>
          <td>${startDate} ~ ${endDate}</td>
          <td>${reservation.status}</td>
          <td>${reservation.guest_name}</td>
        `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("예약 목록 로드 오류:", error.message);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  const reservationId = window.location.pathname.split("/").pop(); // 예약 ID 추출
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(`/api/reservation/${reservationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    const reservation = data.reservation;

    // 예약 상세 내용 표시
    document.getElementById("houseName").textContent = reservation.house_name;
    document.getElementById("guestName").textContent = reservation.guest_name;
    document.getElementById(
      "dates"
    ).textContent = `${reservation.start_date} ~ ${reservation.end_date}`;
    document.getElementById("totalAmount").textContent =
      reservation.total_amount;
    document.getElementById("createdAt").textContent = reservation.created_at;
    document.getElementById("status").textContent = reservation.status;

    // 게스트가 예약을 취소할 수 있는 경우
    if (reservation.is_guest) {
      document.getElementById("guestActions").style.display = "block";
      document
        .getElementById("cancelReservationBtn")
        .addEventListener("click", async () => {
          try {
            const cancelResponse = await fetch(
              `/api/reservation/${reservationId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const cancelData = await cancelResponse.json();
            if (cancelResponse.ok) {
              alert("예약이 취소되었습니다.");
              window.location.href = "/reservation/guest";
            } else {
              alert(cancelData.message);
            }
          } catch (error) {
            console.error("예약 취소 중 오류 발생:", error.message);
          }
        });
    }

    // 호스트가 예약을 승인/거부할 수 있는 경우
    if (reservation.is_host) {
      document.getElementById("hostActions").style.display = "block";

      document
        .getElementById("approveReservationBtn")
        .addEventListener("click", async () => {
          try {
            const statusResponse = await fetch(
              `/api/reservation/${reservationId}/status`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "approved" }),
              }
            );

            const statusData = await statusResponse.json();
            if (statusResponse.ok) {
              alert("예약이 승인되었습니다.");
              window.location.reload();
            } else {
              alert(statusData.message);
            }
          } catch (error) {
            console.error("예약 승인 중 오류 발생:", error.message);
          }
        });

      document
        .getElementById("rejectReservationBtn")
        .addEventListener("click", async () => {
          try {
            const statusResponse = await fetch(
              `/api/reservation/${reservationId}/status`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "rejected" }),
              }
            );

            const statusData = await statusResponse.json();
            if (statusResponse.ok) {
              alert("예약이 거부되었습니다.");
              window.location.reload();
            } else {
              alert(statusData.message);
            }
          } catch (error) {
            console.error("예약 거부 중 오류 발생:", error.message);
          }
        });
    }
  } catch (error) {
    console.error("예약 상세 조회 오류:", error.message);
  }
});

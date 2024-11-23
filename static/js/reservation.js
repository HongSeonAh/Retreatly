document.addEventListener("DOMContentLoaded", () => {
  // DOM에서 데이터 읽기
  const houseName = document.getElementById("houseName").textContent;
  const hostName = document.getElementById("hostName").textContent;
  const pricePerDay = parseInt(
    document.getElementById("pricePerDay").textContent,
    10
  );
  const maxPeople = parseInt(
    document.getElementById("maxPeople").textContent,
    10
  );

  // 숙박 인원 제한 설정
  document.getElementById("numGuests").setAttribute("max", maxPeople);

  // 결제 금액 계산 로직 등록
  document.getElementById("reservationForm").addEventListener("change", () => {
    calculateTotalAmount(pricePerDay, maxPeople);
  });

  // 예약 API 호출
  document
    .getElementById("reservationForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const body = Object.fromEntries(formData.entries());
      body.house_id = window.location.pathname.split("/").pop(); // URL에서 house_id 추출

      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch("/api/reservation", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const result = await response.json();
        if (response.ok) {
          alert("예약이 완료되었습니다!");
          window.location.href = `/reservation/success?total_amount=${
            result.total_amount
          }&calculation_details=${encodeURIComponent(
            result.calculation_details
          )}`;
        } else {
          alert(`예약 실패: ${result.message}`);
        }
      } catch (error) {
        console.error("예약 중 오류 발생:", error.message);
      }
    });
});

// 예약된 날짜를 달력 형식으로 렌더링
function renderReservedDates(reservedDates) {
  const calendar = document.getElementById("reservedDatesCalendar");
  reservedDates.forEach((range) => {
    const div = document.createElement("div");
    div.textContent = `${range.start_date} ~ ${range.end_date}`;
    calendar.appendChild(div);
  });
}

// 금액 계산 로직
function calculateTotalAmount(pricePerDay, maxPeople) {
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);
  const numGuests = parseInt(document.getElementById("numGuests").value, 10);

  if (!startDate || !endDate || isNaN(numGuests)) return;

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    alert("날짜를 올바르게 선택해주세요.");
    return;
  }

  let totalAmount = days * pricePerDay;
  let details = `숙박 ${days}박 x 1박당 ${pricePerDay.toLocaleString()}원`;

  if (numGuests > maxPeople) {
    const extraGuests = numGuests - maxPeople;
    const extraCharge = extraGuests * days * (pricePerDay / maxPeople);
    totalAmount += extraCharge;
    details += ` + 추가 인원 ${extraGuests}명 (${extraCharge.toLocaleString()}원)`;
  }

  document.getElementById("totalAmount").textContent =
    totalAmount.toLocaleString();
  document.getElementById("calculationDetails").textContent = details;
}

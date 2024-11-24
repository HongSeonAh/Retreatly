document.addEventListener("DOMContentLoaded", async () => {
  const myPageButton = document.getElementById("myPageButton");
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login"; // 로그인 페이지로 리디렉션
    return;
  }

  try {
    // 현재 사용자 정보를 가져오는 API 호출
    const response = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userInfo = await response.json();
    if (response.ok) {
      if (userInfo.role === "guest") {
        myPageButton.addEventListener("click", () => {
          window.location.href = "/reservation/guest"; // 게스트 마이페이지
        });
      } else if (userInfo.role === "host") {
        myPageButton.addEventListener("click", () => {
          window.location.href = "/host-houses"; // 호스트 마이페이지
        });
      }
    } else {
      console.error("사용자 정보를 가져오지 못했습니다:", userInfo.message);
    }
  } catch (error) {
    console.error("사용자 정보 확인 중 오류 발생:", error.message);
    alert("사용자 정보를 확인하는 중 오류가 발생했습니다.");
  }
});

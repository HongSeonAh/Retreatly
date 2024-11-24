const apiUrl = "http://localhost:5000"; // Flask 서버 주소

// 회원가입 처리
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // 기본 form 제출 동작을 막음

  const formData = {
    role: document.getElementById("role").value,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value || null,
  };

  try {
    const response = await fetch(`${apiUrl}/user/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    document.getElementById("signupMessage").innerText = result.message; // 응답 메시지 표시
  } catch (error) {
    console.error("Error:", error);
  }
});

// 로그인 처리
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const response = await fetch(`${apiUrl}/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    document.getElementById("loginMessage").innerText = result.message;

    if (result.access_token) {
      localStorage.setItem("jwt_token", result.access_token); // 토큰 저장
      console.log(localStorage.getItem("jwt_token"));

      // 로그인 성공 시 사용자 역할에 따라 리디렉션
      const user = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
      });
      const userData = await user.json();

      if (userData.role === "host") {
        window.location.href = "/host-houses"; // 호스트면 호스트 숙소 페이지로 리디렉션
      } else if (userData.role === "guest") {
        window.location.href = "/houses"; // 게스트면 전체 숙소 목록 페이지로 리디렉션
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// 게스트 목록 로드
document.getElementById("fetchGuests")?.addEventListener("click", async () => {
  try {
    const response = await fetch(`${apiUrl}/guest/list`);
    const result = await response.json();
    const guestList = document.getElementById("guestList");
    guestList.innerHTML = result.guests
      .map((guest) => `<li>${guest.name} (${guest.email})</li>`)
      .join("");
  } catch (error) {
    console.error("Error:", error);
  }
});

// 호스트 목록 로드
document.getElementById("fetchHosts")?.addEventListener("click", async () => {
  try {
    const response = await fetch(`${apiUrl}/host/list`);
    const result = await response.json();
    const hostList = document.getElementById("hostList");
    hostList.innerHTML = result.hosts
      .map((host) => `<li>${host.name} (${host.email})</li>`)
      .join("");
  } catch (error) {
    console.error("Error:", error);
  }
});

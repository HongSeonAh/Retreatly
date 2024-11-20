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
      localStorage.setItem("jwt_token", result.access_token);
      // 로그인 성공 시 호스트 숙소 조회 페이지로 리디렉션
      console.log(localStorage.getItem("jwt_token"));

      window.location.href = "/host-houses";
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

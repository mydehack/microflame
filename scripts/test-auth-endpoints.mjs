async function run() {
  console.log("=== Testing Authentication Endpoints ===");

  // 1. Username check (available)
  const res1 = await fetch("http://localhost:3000/api/auth/check-username?username=innovator_2026");
  const data1 = await res1.json();
  console.log("Check username (innovator_2026):", res1.status, data1);

  // 2. Register user
  const regPayload = {
    email: "student_tester@mit.edu",
    username: "innovator_2026",
    password: "Password1234!",
  };
  const res2 = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify(regPayload),
  });
  const data2 = await res2.json();
  const setCookie = res2.headers.get("set-cookie");
  console.log("Register user:", res2.status, data2, "Set-Cookie:", setCookie ? "PRESENT" : "NONE");

  // 3. Login with username
  const loginPayloadUser = {
    identifier: "innovator_2026",
    password: "Password1234!",
  };
  const res3 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify(loginPayloadUser),
  });
  const data3 = await res3.json();
  console.log("Login with username:", res3.status, data3);

  // 4. Login with email
  const loginPayloadEmail = {
    identifier: "student_tester@mit.edu",
    password: "Password1234!",
  };
  const res4 = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify(loginPayloadEmail),
  });
  const data4 = await res4.json();
  console.log("Login with email:", res4.status, data4);

  // 5. Forgot password
  const res5 = await fetch("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify({ identifier: "innovator_2026" }),
  });
  const data5 = await res5.json();
  console.log("Forgot password:", res5.status, data5);

  console.log("=== End Auth Endpoints Test ===");
}

run().catch(console.error);


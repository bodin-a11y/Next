import { useState } from "react";

export default function Login() {
  const [role, setRole] = useState("SELLER");

  async function handleLogin() {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    alert(`Вход выполнен как ${data.role}`);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Вход</h1>
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option>BUYER</option>
        <option>SELLER</option>
        <option>INSTALLER</option>
        <option>ADMIN</option>
      </select>
      <button onClick={handleLogin}>Войти</button>
    </main>
  );
}

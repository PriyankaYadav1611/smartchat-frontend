import { useState } from 'react';
import { useRouter } from 'next/router';
import { Console } from 'console';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8080/api/users/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      console.log("Response : ", response);
      console.log("User logged in successfully ")
    } else {
      alert('Login failed');
    }
  };

  return (
    <div>
      <h2>SignIn</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">SignIn</button>
      </form>
    </div>
  );
}

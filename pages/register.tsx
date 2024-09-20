import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { API_BASE_URL } from '../config/constants'


export default function Register() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');


  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch(`${API_BASE_URL}/api/users/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      console.log("Response : ", response);
      const data = await response.json();
      console.log("Register successful..!");
      console.log("Got Data: ", data);
      router.push("/login");

    } else {
      alert('Register failed');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit">SignUp</button>
      </form>
    </div>
  );
}

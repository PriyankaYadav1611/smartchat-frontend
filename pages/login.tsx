import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux';

import { setToken } from './store/authSlice';
import { setUsername } from './store/meSlice';


export default function Login() {
    const router = useRouter();
    const dispatch = useDispatch();

    const username = useSelector((state) => state.me.username);
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
            const data = await response.json();

            console.log("Response : ", response);
            console.log("User logged in successfully")

            console.log("response data", data);
            dispatch(setToken(data.token));

            router.push('/chat');
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
                    onChange={(e) => dispatch(setUsername({ username: e.target.value }))}
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

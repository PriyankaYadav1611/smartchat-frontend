import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux';

import { setToken } from '../store/authSlice';
import { API_BASE_URL } from '../config/constants'


export default function Login() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLocalTokenPresent, setIsLocalTokenPresent] = useState(true);

    useEffect(()=>{
        if (localStorage.getItem('token')) {
            router.push("/chat");
        } else {
            setIsLocalTokenPresent(false);
        }
    }, [])

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/api/users/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
        } catch (error) {
            console.log("Your internet seems not connected");
            alert('Please check if you are connected to internet!');
            return;
        }

        if (response.ok) {
            const data = await response.json();

            console.log(" User logged in successfully = Response : ", response);
            localStorage.setItem("token", data.token);
            dispatch(setToken(data.token));

            router.push('/chat');
        } else {
            alert('Please enter correct username and password!');
        }
    };

    if (!isLocalTokenPresent) {
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
}

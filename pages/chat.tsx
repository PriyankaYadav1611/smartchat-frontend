import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { setSocket } from '../store/websocketSlice';
import { setToken } from '../store/authSlice';
import { setUsername } from '../store/meSlice';
import axios from 'axios';
import { setGroups } from '@/store/groupSlice';

export default function Chat() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const { socket, isConnected, stompClient } = useSelector((state) => state.websocket);
    const username = useSelector((state) => state.me.username);
    const groups = useSelector((state) => state.group.groups);

    const [content, setContent] = useState('');
    const [recipient, setRecipient] = useState('');

    useEffect(() => {
        console.log("Chat page useeffect called ..................");
        // let me = getMe();
        if (!isAuthenticated) {
            // User is not authenticated
            // check if token is present in localStorage
            const localToken = localStorage.getItem("token");
            if (!localToken) {
                // token is not present
                // send to login page
                router.push("/login");
            }
            // token is present, check token validity
            getMe();
        }
    }, []);


    useEffect(() => {
        if (isAuthenticated) {
            getAllGroups();
            const socket = new SockJS('http://localhost:8080/ws');
            
            const stompClient = Stomp.over(() => {
                return new SockJS('http://localhost:8080/ws')
              });
            
            stompClient.connect({Authorization: `Bearer ${localStorage.getItem("token")}`}, (frame) => {
                console.log("Chat page useeffect websocket connected ..................");
                dispatch(setSocket({socket: socket, stompClient: stompClient}));
                console.log("Going to subscribe ...");
            });
        }
    }, [isAuthenticated])


    useEffect (() => {
        if (username && stompClient && groups) {
            groups.forEach(group => {
                stompClient.subscribe(`/user/${"groupId-" + group.id}/queue/messages/groups`, (message) => {
                    console.log("got msg..", JSON.parse(message.body));
                });        
            });
        } else {
            console.log("username is null, cann't subscribe without a valid username!");
        }
    },[stompClient, groups, username])

    const sendMessage = () => {
        console.log("Chat page inside send message..................");
        if (socket && content.trim() && recipient.trim()) {
            const message = JSON.stringify({ 'senderId': 9, 'groupId': 27, 'content': content });
            stompClient.send("/app/chat.sendMessage", {}, message);
            console.log("Chat page message sent ..................");
            setContent('');
        }
    };

    async function getMe() {
        const localToken = localStorage.getItem('token');
        try {
            const response = await axios({ 
                method: 'get',
                url: 'http://localhost:8080/api/users/me',
                headers : {
                    'Authorization': 'Bearer ' + localToken,
                },
            });
            console.log("Get me response: ", response);
            dispatch(setUsername({username: response.data.username}));
            dispatch(setToken(localToken))
            
        } catch (error) {
            console.error("Get me err:", error);
            localStorage.removeItem("token");
            router.push("/login");
        }

    }

    async function getAllGroups(){
        const localToken = localStorage.getItem('token');
        const response = await axios({ 
            method: 'get',
            url: 'http://localhost:8080/api/users/groups',
            headers : {
                'Authorization': 'Bearer ' + localToken,
            },
        });
        dispatch(setGroups({groups: response.data}))
        console.log("Get All Groups: ", response);
    }

    return (
        <div>
            <input
                type='text'
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient name"
            >
            </input>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

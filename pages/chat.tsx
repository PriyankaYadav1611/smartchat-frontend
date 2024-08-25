import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { setSocket } from '../store/websocketSlice';
import axios from 'axios';

export default function Chat() {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const { socket, isConnected, stompClient } = useSelector((state) => state.websocket);
    const username = useSelector((state) => state.me.username);

    const [content, setContent] = useState('');
    const [recipient, setRecipient] = useState('');



    useEffect(() => {
        console.log("Chat page useeffect called ..................");
        let me = getMe();

        if (isAuthenticated || localStorage.getItem("token")) {
            
            const socket = new SockJS('http://localhost:8080/ws');
            
            const stompClient = Stomp.over(() => {
                return new SockJS('http://localhost:8080/ws')
              });
            
            stompClient.connect({}, (frame) => {
                console.log("Chat page useeffect websocket connected ..................");
                dispatch(setSocket({socket: socket, stompClient: stompClient}));
                console.log("Going to subscribe ...");
                if (username) {
                    stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
                        console.log("got msg..", JSON.parse(message.body));
                    });
                } else {
                    console.log("username is null, cann't subscribe without a valid username!");
                }
            });
        }
    }, []);

    const sendMessage = () => {
        console.log("Chat page inside send message..................");
        if (socket && content.trim() && recipient.trim()) {
            const message = JSON.stringify({ 'sender': username, 'recipient': recipient, 'content': content });
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
            console.log("Get me data: ", response);
            return response;
        } catch (error) {
            console.error("Get me err:", error);
        }

        // let data = '';

        // let config = {
        //   method: 'get',
        //   maxBodyLength: Infinity,
        //   url: 'http://localhost:8080/api/users/debug/auth',
        //   headers: { 
        //     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNzIzOTY4OTY3LCJleHAiOjE3MjQwMDQ5Njd9.dMG4LS3NFnMYPlWN-M21LfNmzbSrA8foKf46rUR16eA'
        //   },
        //   data : data
        // };
        
        // axios.request(config)
        // .then((response) => {
        //   console.log(JSON.stringify(response.data));
        // })
        // .catch((error) => {
        //   console.log("debug axios err", error);
        // });
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

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function Chat() {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const username = useSelector((state) => state.me.username);



    const [socket, setSocket] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [content, setContent] = useState('');
    const [recipient, setRecipient] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            const socket = new SockJS('http://localhost:8080/ws');
            const stompClient = Stomp.over(socket);
            setSocket(socket);
            setStompClient(stompClient);

            stompClient.connect({}, (frame) => {
                console.log('Connected: ' + frame);
                stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
                    console.log("got msg..", JSON.parse(message.body));
                });
            });
        }
    }, []);

    const sendMessage = () => {
        if (socket && content.trim() && recipient.trim()) {
            const message = JSON.stringify({ 'sender': username, 'recipient': recipient, 'content': content });
            stompClient.send("/app/chat.sendMessage", {}, message);
            setContent('');
        }
    };

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

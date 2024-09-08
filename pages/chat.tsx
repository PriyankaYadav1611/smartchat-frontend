import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { setSocket } from '../store/websocketSlice';
import { setToken } from '../store/authSlice';
import { setMe } from '../store/meSlice';
import axios from 'axios';
import { setGroups, setSelectedGroup } from '@/store/groupSlice';
import { setIdUserMap } from '../store/usersSlice';


import styles from '../styles/Chat.module.css';


export default function Chat() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const { socket, isConnected, stompClient } = useSelector((state) => state.websocket);
    const me = useSelector((state) => state.me);
    const groups = useSelector((state) => state.group.groups);
    const selectedGroup = useSelector((state) => state.group.selectedGroup);
    const idUserMap = useSelector((state) => state.users.idUserMap);

    const [content, setContent] = useState('');

    const [messages, setMessages] = useState<Message[]>([]);



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
            getAllUsers();
            const socket = new SockJS('http://localhost:8080/ws');

            const stompClient = Stomp.over(() => {
                return new SockJS('http://localhost:8080/ws')
            });

            stompClient.connect({ Authorization: `Bearer ${localStorage.getItem("token")}` }, (frame) => {
                console.log("Chat page useeffect websocket connected ..................");
                dispatch(setSocket({ socket: socket, stompClient: stompClient }));
                console.log("Going to subscribe ...");
            });
        }
    }, [isAuthenticated])


    useEffect(() => {
        if (me.username && stompClient && groups) {
            groups.forEach(group => {
                stompClient.subscribe(`/user/${"groupId-" + group.id}/queue/messages/groups`, (message) => {
                    console.log("got msg..", JSON.parse(message.body));
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                });
            });
        }
    }, [stompClient, groups, me.username])

    const sendMessage = () => {
        console.log("Chat page inside send message..................");
        if (socket && content.trim()) {
            console.log("----------------------------Inside sendMessage if-------------------------");
            const message = JSON.stringify({ 'senderId': me.id, 'groupId': selectedGroup.id, 'content': content });
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
                headers: {
                    'Authorization': 'Bearer ' + localToken,
                },
            });
            console.log("Get me response: ", response);
            dispatch(setMe({
                username: response.data.username,
                id: response.data.id,
            }));
            dispatch(setToken(localToken))

        } catch (error) {
            console.error("Get me err:", error);
            localStorage.removeItem("token");
            router.push("/login");
        }

    }

    async function getAllGroups() {
        const localToken = localStorage.getItem('token');
        const response = await axios({
            method: 'get',
            url: 'http://localhost:8080/api/users/groups',
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });
        dispatch(setGroups({ groups: response.data }))
        console.log("Get All Groups: ", response);
        console.log("-----------------------------------" + response.data);
    }

    async function getAllUsers() {
        const localToken = localStorage.getItem('token');
        const response = await axios({
            method: 'get',
            url: 'http://localhost:8080/api/groups/users',
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });

        const users = response.data;
        let idUserMap = {};
        users.forEach(user => {
            idUserMap[parseInt(user.id)] = user;
        });
        dispatch(setIdUserMap({ idUserMap: idUserMap }))

        console.log("Get All users: ", response);
        console.log("-----------------------------------" + response.data);
    }

    const handleGroupClick = (group) => {
        dispatch(setSelectedGroup({ selectedGroup: group }));
    };

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <h2>groups</h2>
                    <ul>
                        {groups.map((group) => (
                            <li
                                key={group.id}
                                onClick={() => handleGroupClick(group)}
                                className={groups?.id === group.id ? styles.active : ''}
                            >
                                {   group.type === "MANY_TO_MANY" ? 
                                        group.title :
                                        (group.groupMembers ?
                                            (group.groupMembers[0]==me.id ? idUserMap[group.groupMembers[1]].username : idUserMap[group.groupMembers[0]].username) :
                                            group.title
                                        )
                                }
                            </li>
                        ))}
                    </ul>
                </div>
                {/* -------------------------Left container end---------------------------------------------- */}

                <div className={styles.chatWindow}>
                    {selectedGroup ? (
                        <>
                            <div className={styles.chatHeader}>
                                <h3>{
                                    
                                    selectedGroup.type === "MANY_TO_MANY" ? 
                                    selectedGroup.title :
                                        (selectedGroup.groupMembers ?
                                            (selectedGroup.groupMembers[0]==me.id ? idUserMap[selectedGroup.groupMembers[1]].username : idUserMap[selectedGroup.groupMembers[0]].username) :
                                            selectedGroup.title
                                        )    
                                }</h3>
                            </div>
                            <div className={styles.chatMessages}>
                                <p>This is the chat with {selectedGroup.title}</p>
                            </div>


                            <div className={styles.chatMessages}>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.message} ${message.senderId == me.id ? styles.sent : styles.received}`}
                                    >
                                        <div
                                            className={`${styles.messageContent} ${message.senderId == me.id ? styles.sentMessage : styles.receivedMessage}`}
                                        >
                                            <strong>{message.sender}</strong> {message.content}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.chatInput}>
                                <input type="text" placeholder="Type a message..." value={content}
                                    onChange={(e) => setContent(e.target.value)} />
                                <button onClick={sendMessage}>Send</button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.noChatSelected}>
                            <h3>Select a contact to start chatting</h3>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

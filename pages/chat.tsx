import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'
import { setSocket, clearSocket } from '../store/websocketSlice';
import { setToken } from '../store/authSlice';
import { setMe } from '../store/meSlice';
import axios from 'axios';
import { setGroups, setSelectedGroup } from '@/store/groupSlice';
import { setIdUserMap } from '../store/usersSlice';
import { setGroupIdMessagesMap,setMessage } from '@/store/messagesSlice';

import { connectStomp, reconnectStomp } from '../api/stomp'
import { getMe, getAllUsers } from '../api/users'



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
    const groupIdMessagesMap = useSelector((state) => state.messages.groupIdMessagesMap);

    const [content, setContent] = useState('');



    useEffect(() => {
        console.log("Chat page useeffect called ..................");
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
            getAndSetMe();
        }
    }, []);


    useEffect(() => {
        if (isAuthenticated) {
            // get and set all groups for this user and all group's all messages
            getAllGroups();

            // get and set all group's all users
            getAndSetAllUsers();

            // connet to STOMP
            connectStomp(handleReceivedMessage, handleConnected, handleError);
        }
    }, [isAuthenticated])


    useEffect(() => {
        console.log("Going to subscribe all groups")
        if (me.username && stompClient && groups) {
            console.log("Inside if: Going to subscribe all groups");
            groups.forEach(group => {
                stompClient.subscribe(`/user/${"groupId-" + group.id}/queue/messages/groups`, (message) => {
                    console.log("got msg..", JSON.parse(message.body));
                    const newMessage = JSON.parse(message.body);
                    dispatch(setMessage({message: newMessage}));
                });
            });
        } else {
            console.log("(me.username && stompClient && groups) is false: stompClient:", stompClient);
        }
    }, [stompClient, groups, me.username])


    useEffect(() => {
        console.log("GroupIdMessageMap:", groupIdMessagesMap);
    }, [groupIdMessagesMap])

    const sendMessage = () => {
        console.log("Chat page inside send message..................");
        if (stompClient && content.trim()) {
            console.log("----------------------------Inside sendMessage if-------------------------");
            const message = JSON.stringify({ 'senderId': me.id, 'groupId': selectedGroup.id, 'content': content });
            stompClient.send("/app/chat.sendMessage", {}, message);
            console.log("Chat page message sent ..................");
            setContent('');
        } else {
            console.log("(stompClient && content.trim()) is false, stompClient:", stompClient);
        }
    };

    const getAndSetMe = async () => {
        try {
            const localToken = localStorage.getItem('token');
            const me = await getMe();
            dispatch(setMe(me));
            dispatch(setToken(localToken))
        } catch(error) {
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
        dispatch(setGroups({ groups: response.data }));
        console.log("Get All Groups: ", response);
        console.log("-----------------------------------" + response.data);
        
        // get and store all messages for each group
        const groups = response.data;
        groups.forEach(group => {
            getMessagesByGroupId(group.id);
        });
    }

    const getAndSetAllUsers = async () => {
        try {
            const users = await getAllUsers();
            let idUserMap = {};
            users.forEach(user => {
                idUserMap[parseInt(user.id)] = user;
            });
            dispatch(setIdUserMap({ idUserMap: idUserMap }))
        } catch(error) {
            console.error("getAllUsers err:", error);
        }

    }    


    const handleGroupClick = (group) => {
        dispatch(setSelectedGroup({ selectedGroup: group }));
        console.log("---------------------------------",selectedGroup?.id)
    };

    // Function to call get API to get all messages for given group
    // and set global store accordingly
    const getMessagesByGroupId = async (groupId) => {
        // call get call to get all messages for this groupId
        // set the messages to global store
        const localToken = localStorage.getItem('token');
        const response = await axios({
            method: 'get',
            url: `http://localhost:8080/api/groups/${groupId}/messages`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });

        const messages = response.data;
        console.log(`message for groupId: ${groupId}, are: ${messages}`);

        // set messages in store
        const groupIdMessagesMap = {};
        groupIdMessagesMap[groupId] = messages;
        dispatch(setGroupIdMessagesMap({groupIdMessagesMap: groupIdMessagesMap}));
    }
// ------------------------------------------------------------------------------------------------------------------------------------------------------
const handleConnected = (socket, stompClient) => {
    console.log("Handle connected called");
    dispatch(setSocket({ socket: socket, stompClient: stompClient }));
    console.log('STOMP connected successfully');
};

// Function to handle errors
const handleError = (error) => {
console.log('STOMP connection error:', error);
dispatch(clearSocket());
reconnectStomp(handleReceivedMessage, handleConnected, handleError); // Attempt reconnection
};

// Function to handle received messages
const handleReceivedMessage = (newMessage) => {
//setMessagess((prevMessages) => [...prevMessages, newMessage]);
    dispatch(setMessage({message: newMessage}));
};


    const sortedMessages = selectedGroup?.id && groupIdMessagesMap[selectedGroup.id] ? groupIdMessagesMap[selectedGroup.id].slice().sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    : [];
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
                            {sortedMessages.length > 0 ? (
                                sortedMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.message} ${message.senderId == me.id? styles.sent : styles.received}`}
                                    >
                                        <div
                                        className={`${styles.messageContent} ${message.senderId == me.id ? styles.sentMessage : styles.receivedMessage}`}
                                        >
                                        <strong>{message.sender}</strong>{message.content}
                                        </div>
                                    </div>
                                    ))
                                ) : (
                                    <div>Select a group to view messages</div>
                                )}
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

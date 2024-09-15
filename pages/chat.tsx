import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'
import { setSocket, clearSocket } from '../store/websocketSlice';
import { setToken } from '../store/authSlice';
import { getAndSetMe } from '../store/meSlice';
import { setGroups, setSelectedGroup } from '@/store/groupSlice';
import { setIdUserMap } from '../store/usersSlice';
import { setGroupIdMessagesMap,setMessage } from '@/store/messagesSlice';

import { RootState } from '../store';
import { connectStomp, reconnectStomp } from '../api/stomp';
import { getMe, getAllUsers } from '../api/users';
import { getAllGroups } from '../api/groups';
import { getMessagesByGroupId } from '../api/messages';

import styles from '../styles/Chat.module.css';


export default function Chat() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { socket, isConnected, stompClient } = useSelector((state: RootState) => state.websocket);
    // const me = useSelector((state: RootState) => state.me);
    const { me, isLoading: isGettingMe, error: getMeError} = useSelector((state: RootState) => state.me);
    const groups = useSelector((state: RootState) => state.group.groups);
    const selectedGroup = useSelector((state: RootState) => state.group.selectedGroup);
    const idUserMap = useSelector((state: RootState) => state.users.idUserMap);
    const groupIdMessagesMap = useSelector((state: RootState) => state.messages.groupIdMessagesMap);

    const [content, setContent] = useState('');





    useEffect(() => {
        console.log("Chat page useeffect called ..................");
        if (getMeError) {
            router.push('/login');
        } else if (!me) {
            // User is not authenticated
            // check if token is present in localStorage
            const localToken = localStorage.getItem("token");
            if (!localToken) {
                // token is not present
                // send to login page
                router.push("/login");
            }
            // token is present, check token validity
            dispatch(getAndSetMe());
        }
    }, [dispatch, me]);


    useEffect(() => {
        if (me) {
            // get and set all groups for this user and all group's all messages
            getAndSetAllGroups();

            // get and set all group's all users
            getAndSetAllUsers();

            // connet to STOMP
            connectStomp(handleReceivedMessage, handleConnected, handleError);
        }
    }, [me])


    useEffect(() => {
        console.log("Going to subscribe all groups")
        if (me?.username && stompClient && groups) {
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
    }, [stompClient, groups, me])


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


    async function getAndSetAllGroups() {
        try {
            const groups = await getAllGroups();
            dispatch(setGroups({ groups: groups }));
            // get and store all messages for each group
            groups.forEach(group => {
                getAndSetMessagesByGroupId(group.id);
            });
        } catch (error) {
            console.error("getAllGroups err:", error);
        }
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
    const getAndSetMessagesByGroupId = async (groupId) => {
        // call get call to get all messages for this groupId
        // set the messages to global store
        try {
            const messages = await getMessagesByGroupId(groupId);
            console.log(`message for groupId: ${groupId}, are: ${messages}`);

            // set messages in store
            const groupIdMessagesMap = {};
            groupIdMessagesMap[groupId] = messages;
            dispatch(setGroupIdMessagesMap({groupIdMessagesMap: groupIdMessagesMap}));
        } catch (error) {
            console.error("getMessagesByGroupId err:", error);
        }
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
        dispatch(setMessage({message: newMessage}));
    };

    const sortedMessages = selectedGroup?.id && groupIdMessagesMap[selectedGroup.id] ? groupIdMessagesMap[selectedGroup.id].slice().sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) : [];
    
    
    if (isGettingMe || (!(groups?.length)) || !idUserMap) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <h2>Chat App</h2>
                    <h3> New Chat</h3>
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
                                {
                                    sortedMessages.length > 0 ?
                                    (
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
                                    ) :
                                    (
                                        <div>No messages, start chatting...</div>
                                    )
                                }
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

import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

import { API_BASE_URL } from '../config/constants'


// Function to initialize the STOMP connection
export const connectStomp = (onMessageReceived, onConnected, onError) => {

    const socket = new SockJS(`${API_BASE_URL}/ws`);

    const stompClient = Stomp.over(() => {
        return new SockJS(`${API_BASE_URL}/ws`)
    });

    stompClient.connect({ Authorization: `Bearer ${localStorage.getItem("token")}` }, (frame) => {
        onConnected(socket, stompClient);
        if (onConnected) {
            console.log("going to call onConnected");
            onConnected(socket, stompClient);
        } else {
            console.log("Must provide isCOnnected");
        }
    }, (error) => {
            console.log('STOMP connection error:', error);
            if (onError) {
              onError(error);
            } else {
                console.log("Must provide onError");
            }
        }
    );
};

// Function to reconnect STOMP after disconnection

export const reconnectStomp = (onMessageReceived, onConnected, onError) => {
    console.log('Attempting to reconnect...');
    setTimeout(() => {
        connectStomp(onMessageReceived, onConnected, onError);
    }, 5000); // 5 second delay before attempting reconnection
};


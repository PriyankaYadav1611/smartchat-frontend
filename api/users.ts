import axios from 'axios';

import { API_BASE_URL } from '../config/constants'


export async function getMe() {
    const localToken = localStorage.getItem('token');
    try {
        const response = await axios({
            method: 'get',
            url: `${API_BASE_URL}/api/users/me`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });
        console.log("Get me response:", response);
        // return user object
        return  {
            username: response.data.username,
            id: response.data.id
        };

    } catch (error) {
        console.error("getMe err:", error);
        throw error;
    }

}

export async function getAllReleventUsers() {
    const localToken = localStorage.getItem('token');
    try {
        const response = await axios({
            method: 'get',
            url: `${API_BASE_URL}/api/groups/users`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });

        const users = response.data;
        return users;
    } catch (error) {
        console.error("getAllUsers err:", error);
        throw error;
    }
}

export async function getAllUsers() {
    const localToken = localStorage.getItem('token');
    try {
        const response = await axios({
            method: 'get',
            url: `${API_BASE_URL}/api/users`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });

        const users = response.data;
        return users;
    } catch (error) {
        console.error("getAllUsers err:", error);
        throw error;
    }
}
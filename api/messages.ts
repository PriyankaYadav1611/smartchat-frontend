import axios from 'axios';
import {BASE_URL} from './constants';


export async function getMessagesByGroupId(groupId) {
    if (!groupId) {
        throw "Must provide a groupId";
    }
    const localToken = localStorage.getItem('token');
    try {
        const response = await axios({
            method: 'get',
            url: `${BASE_URL}/api/groups/${groupId}/messages`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });
        return response.data;
    } catch (error) {
        console.error("getMessagesByGroupId err:", error);
        throw error;
    }
}
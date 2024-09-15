import axios from 'axios';
import {BASE_URL} from './constants';


export async function getAllRelevantGroups() {
    const localToken = localStorage.getItem('token');
    try {
        const response = await axios({
            method: 'get',
            url: `${BASE_URL}/api/users/groups`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
        });
        return response.data;
    } catch (error) {
        console.error("getAllGroups err:", error);
        throw error;
    }
}
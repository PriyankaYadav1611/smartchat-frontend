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

export async function createNewGroup(title, description, type, groupMembers, myId) {
    const localToken = localStorage.getItem('token');
    if (!groupMembers.find((id) => id == myId)) {
        groupMembers.push(myId);
    }

    let data = {};
    if (title) {
        data.title = title;
    }
    if (description) {
        data.description = description;
    }
    if (type) {
        data.type = type;
    }
    if (groupMembers) {
        data.groupMembers = groupMembers;
    }

    data = JSON.stringify(data);

    try {
        const response = await axios({
            method: 'post',
            url: `${BASE_URL}/api/groups`,
            headers: {
                'Authorization': 'Bearer ' + localToken,
            },
            data: data,
        });
        return response.data;
    } catch (error) {
        console.error("create new group err:", error);
        throw error;
    }
}

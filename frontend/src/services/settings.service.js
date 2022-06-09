import { authHeader, handleResponse } from '../helpers';
import {apiUrl} from "../constants";

export const settingsService = {
    getAll,
    updateAll
};

function getAll() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/settings`, requestOptions).then(handleResponse);
}

function updateAll(id, data) {
    const requestOptions = { method: 'PATCH', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/settings/${id}`, requestOptions).then(handleResponse);
}
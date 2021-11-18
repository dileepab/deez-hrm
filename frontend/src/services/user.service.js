import { authHeader, handleResponse } from '../helpers';
import {apiUrl} from "../constants";

export const userService = {
    getAll,
    getById
};

function getAll() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/users`, requestOptions).then(handleResponse);
}

function getById(id) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}
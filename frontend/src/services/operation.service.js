import { authHeader, handleResponse } from '../helpers';
import {apiUrl} from "../constants";

export const operationService = {
    addOperations,
    updateOperations,
    addAllOperations,
};

function addOperations(data) {
    const requestOptions = { method: 'POST', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/steps`, requestOptions).then(handleResponse);
}

function updateOperations(id, data) {
    const requestOptions = { method: 'PUT', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/steps/${id}`, requestOptions).then(handleResponse);
}

function addAllOperations(data) {
    const requestOptions = { method: 'POST', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/steps-multi`, requestOptions).then(handleResponse);
}
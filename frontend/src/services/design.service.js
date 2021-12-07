import { authHeader, handleResponse } from '../helpers';
import {apiUrl} from "../constants";

export const designService = {
    getAllDesigns,
    getLastTwoMonthsAllDesigns,
    getAllDesignsWithOperator,
    getAllIncompleteDesignsWithOperator,
    getIncompleteDesignsWithOperations,
    addDesign,
    deleteDesign,
    editDesign,
};

function getAllDesigns(type) {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/designs?filter={${type === 'incomplete'? '"where":{"isComplete": false},' : type === 'complete'? '"where":{"isComplete": true},' : '' }"order": ["id desc"],"include": [{"relation": "steps", "scope":{"include": [{"relation": "operatorSteps", "order": ["id desc"], "scope":{"include": [{"relation": "operator"}]}}]}}]}`, requestOptions).then(handleResponse);
}

function getLastTwoMonthsAllDesigns() {
    let today = new Date();
    let startMonth = new Date(today);
    startMonth.setMonth(startMonth.getMonth() - 3);
    let startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/designs?filter={
          "where": {
            "startTime": {
              "gte": [
                "${startDate.toUTCString()}"
              ]
            }
          },"order": ["id desc"],"include": [{"relation": "steps",
        "scope": {
          "fields": {
            "id": "true",
            "estimatedTime": "true",
            "designId": "true"
          },
          "include": [{"relation": "operatorSteps", "order": ["id desc"]}]
        }}]}`, requestOptions).then(handleResponse);
}

function getAllDesignsWithOperator() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/designs?filter={"order": ["id desc"],"include": [{"relation": "steps", "scope":{"include": [{"relation": "operatorSteps", "scope":{"include": [{"relation": "operator"}]}}]}}]}`, requestOptions).then(handleResponse);
}

function getAllIncompleteDesignsWithOperator() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/designs?filter={"where":{"isComplete": false},"order": ["id desc"],"include": [{"relation": "steps", "scope":{"include": [{"relation": "operatorSteps", "scope":{"include": [{"relation": "operator"}]}}]}}]}`, requestOptions).then(handleResponse);
}

function getIncompleteDesignsWithOperations() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/designs?filter={"where":{"isComplete": false},"order": ["id desc"],"include": [{"relation": "steps"}]}`, requestOptions).then(handleResponse);
}

function addDesign(data) {
    const requestOptions = { method: 'POST', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/designs`, requestOptions).then(handleResponse);
}

function deleteDesign(id) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${apiUrl}/designs/${id}`, requestOptions).then(handleResponse);
}

function editDesign(id, data) {
    const requestOptions = { method: 'PATCH', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/designs/${id}`, requestOptions).then(handleResponse);
}

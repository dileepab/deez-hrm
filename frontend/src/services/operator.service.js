import { authHeader, handleResponse } from '../helpers';
import {apiUrl} from "../constants";

export const operatorService = {
    getOperatorWithOperations,
    getOperators,
    addOperator,
    editOperator,
    updateOperatorSteps,
    deleteOperator,
    fetchDesigns,
    addOperatorOperations,
};

function getOperatorWithOperations() {
    let today = new Date();
    let startMonth = new Date(today);
    startMonth.setMonth(startMonth.getMonth() - 1);
    let startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    console.log(startDate.toUTCString());
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/operators?filter=
  {
    "where":{"isResigned": false},
    "include": [
      {
        "relation": "operatorSteps",
        "scope": {
          "where": {
            "completeTime": {
              "gte": [
                "${startDate.toUTCString()}"
              ]
            }
          },
          "order": [
            "id desc"
          ],
          "fields": {
            "id": "true",
            "stepId": "true",
            "operatorId": "true",
            "completeTime": "true",
            "quantity": "true"
          },
          "include": [
            {
              "relation": "step",
              "scope": {
                "fields": {
                  "id": "true",
                  "name": "true",
                  "estimatedTime": "true",
                  "designId": "true"
                }
              }
            }
          ]
        }
      }
    ]
  }`,
        requestOptions).then(handleResponse);
}

function getOperators() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/operators`,
        requestOptions).then(handleResponse);
}

function addOperator(data) {
    const requestOptions = { method: 'POST', headers: authHeader(), body: JSON.stringify(data), };
    return fetch(`${apiUrl}/operators`, requestOptions).then(handleResponse);
}

function editOperator(id, data) {
    const requestOptions = { method: 'PATCH', headers: authHeader(), body: JSON.stringify(data), };
    return fetch(`${apiUrl}/operators/${id}`, requestOptions).then(handleResponse);
}

function updateOperatorSteps(id, data) {
    const requestOptions = { method: 'PATCH', headers: authHeader(), body: JSON.stringify(data), };
    return fetch(`${apiUrl}/operator-steps/${id}`, requestOptions).then(handleResponse);
}

function deleteOperator(id) {
    const requestOptions = { method: 'DELETE', headers: authHeader() };
    return fetch(`${apiUrl}/operators/${id}`, requestOptions).then(handleResponse);
}

function fetchDesigns() {
    const requestOptions = { method: 'GET', headers: authHeader() };
    return fetch(`${apiUrl}/designs?filter={"where":{"isComplete": false},"order": ["id desc"],"include": [{"relation": "steps"}]}`, requestOptions).then(handleResponse);
}

function addOperatorOperations(data) {
    const requestOptions = { method: 'POST', headers: authHeader(), body: JSON.stringify(data) };
    return fetch(`${apiUrl}/operator-steps`, requestOptions).then(handleResponse);
}

import {authHeader, handleResponse} from '../helpers';
import {apiUrl} from "../constants";

export const codService = {
    getCodByCod,
    getCodByStatusAndDate,
    addCods,
    updateCod,
    updateCodPaymentReceived,
};

function getCodByCod(cod) {
    const requestOptions = {method: 'Get', headers: authHeader()};
    return fetch(`${apiUrl}/cod?filter={"where": {"cod": "${cod}"}}`, requestOptions).then(handleResponse);
}

function getCodByStatusAndDate(codStatus, startDate, endDate) {
    const requestOptions = {method: 'Get', headers: authHeader()};
    return fetch(`${apiUrl}/cod?filter={"where": {"and": [{"date": {"between": ["${startDate.toUTCString()}","${endDate.toUTCString()}"]}},
      {"or": [{"status": "${codStatus.dispatch ? "dispatch" : ""}"},
          {"status": "${codStatus.return ? "return" : ""}"},
          {"status": "${codStatus.paymentReceive ? "payment_received" : ""}"}
        ]}]},"fields": {"cod": true, "amount": true, "status": true}}`, requestOptions).then(handleResponse);
}

function addCods(data) {
    const requestOptions = {method: 'POST', headers: authHeader(), body: JSON.stringify(data)};
    return fetch(`${apiUrl}/cod-multiple`, requestOptions).then(handleResponse);
}

function updateCod(data, id) {
    const requestOptions = {method: 'PATCH', headers: authHeader(), body: JSON.stringify(data)};
    return fetch(`${apiUrl}/cod/${id}`, requestOptions).then(handleResponse);
}

function updateCodPaymentReceived(data, id) {
    const requestOptions = {method: 'PATCH', headers: authHeader(), body: JSON.stringify(data)};
    return fetch(`${apiUrl}/cod-payment-received`, requestOptions).then(handleResponse);
}
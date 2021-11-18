import { authenticationService } from '../services';
import {toast} from "react-toastify";

export function handleResponse(response) {

    const notify = (error) => toast.error(error);
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if ([401, 403].indexOf(response.status) !== -1) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                authenticationService.logout();
            }

            const error = (data && data.error && data.error.message) || response.statusText;
            notify(error);
            return Promise.reject(error);
        }
        return data;
    });
}
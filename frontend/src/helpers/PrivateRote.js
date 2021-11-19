import React  from 'react';
import { Route, Navigate } from 'react-router-dom';
import {authenticationService} from "../services";

const PrivateRoute = ({ component: Component, roles, ...rest }) => {

    return (
        <Route {...rest}
            render={routeProps => {
                const currentUser = authenticationService.currentUserValue;
                if (!currentUser) {
                    // not logged in so redirect to login page with the return url
                    return <Navigate to={{ pathname: '/sign-in', state: { from: routeProps.location } }} />
                }

                // check if route is restricted by role
                if (roles && roles.filter(value => currentUser.roles.includes(value)).length === 0) {
                    // role not authorised so redirect to home page
                    return authenticationService.logout();
                }
                return <Component {...routeProps} />;
            }}
        />
    );
    /*  we are spreading routeProps to be able to access this routeProps in the component. */
};

export default PrivateRoute;

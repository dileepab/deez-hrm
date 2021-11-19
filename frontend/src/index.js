import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

// Keep this puppy here for later!

// Set up Redux/Router
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import { usePromiseTracker } from "react-promise-tracker";
import Loader from 'react-loader-spinner';

// Import reducer/index.js as root reducer, it's where we're combining all our reducer files
import rootReducer from './store/reducers';
import reportWebVitals from './reportWebVitals';

const store = createStore(rootReducer, applyMiddleware(thunk, logger));

const LoadingIndicator = () => {

    const { promiseInProgress } = usePromiseTracker();
    return (
        promiseInProgress &&
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: 'fixed',
                top: 0,
                left: 0,
                background: 'rgba(0, 0, 0, .2)',
                zIndex: 10,
            }}
        >
            <Loader type="Bars" color={"#343a40"} height={80} width={100}/>
        </div>
    );
}

ReactDOM.render(
    <Provider store={store}>
        {/*<Router>*/}
            <App />
            <LoadingIndicator/>
        {/*</Router>*/}
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
reportWebVitals();

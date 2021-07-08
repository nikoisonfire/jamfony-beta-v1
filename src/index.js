import React from 'react';
import ReactDOM from 'react-dom';
import './styles/general.sass';
import * as serviceWorker from './serviceWorker';

import {ReactQueryDevtools} from 'react-query-devtools';

import App from "./components/App";
import Firebase, {FirebaseContext} from "./components/Firebase";
import {RecoilRoot} from "recoil";
import {getObjectFromStorage, storageKeys} from "./recoil/storageHelpers";

require('es6-promise').polyfill();
require('dotenv').config();

// TODO: Experimental state! Check for Recoil API Changes!
const initializeState = ({set}) => {
    storageKeys.forEach(key => {
        const value = getObjectFromStorage(key);
        console.log("key: " + key);
        if (value != null) {
            set({key}, value);
        }
    });
};

ReactDOM.render(
    <FirebaseContext.Provider value={new Firebase()}>
        <ReactQueryDevtools initialIsOpen={false}/>
        <RecoilRoot initializeState={initializeState}>
            <App/>
        </RecoilRoot>
    </FirebaseContext.Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

import {atom} from 'recoil';

// Get Session Store Values from localStorage
// const local = getObjectFromStorage("sessionStore");

const DEFAULT_SESSION_STORE_VALUE = {
    loggedIn: false,
    user: {}
};

const sessionStore = atom({
    key: 'sessionStore',
    default: DEFAULT_SESSION_STORE_VALUE,
    persistence_UNSTABLE: {type: true}
});

export {DEFAULT_SESSION_STORE_VALUE} ;

export default sessionStore;
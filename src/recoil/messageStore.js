import {atom} from 'recoil';

// Get Session Store Values from localStorage
// const local = getObjectFromStorage("sessionStore");

const DEFAULT_MESSAGE_STORE_VALUE = {
    messages: {
        threads: [],
        unreadCount: 0
    },
    notifications: {
        notifications: [],
        unreadCount: 0
    }
};

const messageStore = atom({
    key: 'messageStore',
    default: DEFAULT_MESSAGE_STORE_VALUE,
    persistence_UNSTABLE: {type: true}
});

export {DEFAULT_MESSAGE_STORE_VALUE} ;

export default messageStore;
import {atom} from 'recoil';

// Get Session Store Values from localStorage
// const local = getObjectFromStorage("sessionStore");

const DEFAULT_AC_STORE_VALUE = {
    selected: []
};

const autocompleteStore = atom({
    key: 'autocompleteStore',
    default: DEFAULT_AC_STORE_VALUE
});

export {DEFAULT_AC_STORE_VALUE};

export default autocompleteStore;
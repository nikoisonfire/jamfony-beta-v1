// Keys for all storages (needed for initialize Value)
const storageKeys = ["sessionStore", "userStore"];

const getObjectFromStorage = (key) => JSON.parse(window.localStorage.getItem(key));

const putObjectInStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));

export {getObjectFromStorage, putObjectInStorage, storageKeys};
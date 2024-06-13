import { storageItems } from "../constants/storage";

const getItem = (itemName) => {
    return localStorage.getItem(itemName);
};

const setItem = (itemName, value) => {
    localStorage.setItem(itemName, value);
};

const deleteItem = (itemName) => {
    localStorage.removeItem(itemName);
};

const clear = () => {
    localStorage.clear();
};

export const getAccessToken = () => {
    return getItem(storageItems.ACCESS_TOKEN);
};

export const getRefreshToken = () => {
    return getItem(storageItems.REFRESH_TOKEN);
};

export const deleteAccessToken = () => {
    return deleteItem(storageItems.ACCESS_TOKEN);
};

export const deleteRefreshToken = () => {
    return deleteItem(storageItems.REFRESH_TOKEN);
};

export const setAccessToken = (value) => {
    return setItem(storageItems.ACCESS_TOKEN, value);
};

export const setRefreshToken = (value) => {
    return setItem(storageItems.REFRESH_TOKEN, value);
};

export const clearStorage = () => {
    return clear();
};

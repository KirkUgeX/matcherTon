export const getGoogleClientId = () => {
    return process.env.REACT_APP_CLIENT_ID || window._env_.REACT_APP_CLIENT_ID;
};

export const getUMSHost = () => {
    return (process.env.REACT_APP_UMS_HOST || window._env_.REACT_APP_UMS_HOST);
};

export const getMainHost = () => {
    return process.env.REACT_APP_MAIN_HOST || window._env_.REACT_APP_MAIN_HOST;
};

export const getEnv = () => {
    return process.env?.NODE_ENV || window._env_?.NODE_ENV;
};

export const getSocketsHost = () => {
    return process.env.REACT_APP_SOCKETS_HOST || window._env_?.REACT_APP_SOCKETS_HOST;
};

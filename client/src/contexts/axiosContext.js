import React, { useEffect, useRef, useMemo, useContext, createContext } from 'react';
import axios from 'axios';

const TOKEN_KEY = '@sap_web-Token'

export const AxiosContext = createContext(null);

const AxiosProvider = ({
    config = {},
    requestInterceptors = [
        async config => {
            const token = window.localStorage.getItem(TOKEN_KEY)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        }
    ],
    responseInterceptors = [],
    children,
}) => {

    const instanceRef = useRef(axios.create(config));
    const contextInstance = instanceRef.current
    //contextInstance.defaults.headers.common['Content-Type'] = 'application/json'

    const instance = useMemo(() => {
        return contextInstance || axios;
    }, [contextInstance]);

    const controllerRef = useRef(new AbortController());

    const cancel = () => {
        controllerRef.current.abort();
    };

    useEffect(() => {
        requestInterceptors.forEach((interceptor) => {
            instanceRef.current.interceptors.request.use(
                interceptor
            );
        });
        responseInterceptors.forEach((interceptor) => {
            instanceRef.current.interceptors.response.use(
                interceptor
            );
        });
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const callAxios = async (url, method, payload) => {
        let error, data
        try {
            const response = await instance.request({
                signal: controllerRef.current.signal,
                data: payload,
                method,
                url: `http://10.25.163.126:3013${url}`,
            });
            return { data: response.data, error }
        } catch (error) {
            return { data, error: error }
        }
    }

    return (
        <AxiosContext.Provider value={{
            instance: contextInstance,
            callAxios,
            cancel
        }}>
            {children}
        </AxiosContext.Provider>
    );
};

export default AxiosProvider;

export const useAxios = () => useContext(AxiosContext)
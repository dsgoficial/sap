import ReactDOM from 'react-dom';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import APIProvider from './contexts/apiContext';
import * as serviceWorker from './serviceWorker';
import reportWebVitals from './reportWebVitals';
import Loading from './components/Loading'
import { SnackbarProvider } from 'notistack';

const App = lazy(() => import('./App'))

ReactDOM.render(

    <HelmetProvider>
        <APIProvider>
            <BrowserRouter>
                <Suspense fallback={<Loading open={true} />}>
                    <SnackbarProvider maxSnack={3}>
                        <App />
                    </SnackbarProvider>
                </Suspense>
            </BrowserRouter>
        </APIProvider>
    </HelmetProvider>,
    document.getElementById('root')
);

// If you want to enable client cache, register instead.
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
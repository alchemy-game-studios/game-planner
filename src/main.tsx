import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import App from './App';
import AppRouter from './router'
import reportWebVitals from './reportWebVitals';

import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import { BreadcrumbProvider } from '@/context/breadcrumb-context';
import { AuthProvider } from '@/context/auth-context';

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: '/graphql', // Uses Vite proxy in dev, direct path in prod
  cache: new InMemoryCache(),
  credentials: 'include' // Send cookies with requests
});

const root = ReactDOM.createRoot(
  document.getElementById('root')!
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BreadcrumbProvider>
          <AppRouter />
        </BreadcrumbProvider>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

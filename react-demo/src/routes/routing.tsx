import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import {
  ROUTE_ALL,
  ROUTE_DEFAULT,
  ROUTE_LOGIN,
  ROUTE_SIGNUP,
} from '../config/constants';

// Composants temporaires pour l'exemple
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;
const Signup = () => <div>Signup Page</div>;
const ErrorPage = () => <div>404 - Page Not Found</div>;

export const router = createBrowserRouter([
  {
    path: ROUTE_DEFAULT,
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: ROUTE_LOGIN,
    element: <Login />,
  },
  {
    path: ROUTE_SIGNUP,
    element: <Signup />,
  },
  {
    path: ROUTE_ALL,
    element: <ErrorPage />,
  },
]);

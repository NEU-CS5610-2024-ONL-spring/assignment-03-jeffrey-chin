import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";
import { UserBooksProvider } from "./UserBooksContext";
import { UserProvider } from "./UserContext";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import VerifyUser from "./components/VerifyUser";
import Profile from "./components/Profile";
import SearchBooks from "./components/SearchBooks";
import BookDetails from "./components/BookDetails";
import AuthDebugger from "./components/AuthDebugger";
import 'bootstrap/dist/css/bootstrap.min.css';

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

const requestedScopes = ["profile", "email"];

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <UserProvider>
          <UserBooksProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/verify-user" element={<VerifyUser />} />
                <Route path="/profile" element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                } />
                <Route path="/search" element={<SearchBooks />} />
                <Route path="/details/:id" element={<BookDetails />} />
                <Route path="/auth-debugger" element={<AuthDebugger />} />
              </Routes>
            </BrowserRouter>
          </UserBooksProvider>
        </UserProvider>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);

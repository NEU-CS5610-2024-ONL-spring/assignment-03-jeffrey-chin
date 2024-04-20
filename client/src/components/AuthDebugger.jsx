import { useState, React } from 'react';
import { useAuthToken } from "../AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";
import Loading from './Loading';
import "../css/AuthDebugger.css";

function AuthDebugger() {
  const { isLoading, loginWithRedirect } = useAuth0();
  const { accessToken } = useAuthToken();
  const [user, setUser] = useState();

  async function getUser() {
    const request = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (request.ok) {
      const user = await request.json();
      setUser(user);
      return user;
    } else {
      return null;
    }
  }

  async function testPingEndpoint() {
    const request = await fetch(`${process.env.REACT_APP_API_URL}/ping`, {
      method: "GET",
    });

    if (request.ok) {
      const response = await request.text();
      alert(response);
      return response;
    } else {
      return null;
    }
  }

  return (
    <section className="auth-debugger">
      <h1 className="mb-3">Auth Debugger</h1>

      <Button className="mb-3 m-auto" onClick={testPingEndpoint}>
        Test /ping
      </Button>

      {accessToken ?
        <section className="access-token-section">
          <h2>Access Token:</h2>
          <p>{accessToken}</p>

          <p>Endpoint for sending token in header:</p>
          <Button onClick={getUser}>
            Get /user
          </Button>

          {user &&
            <section className="user-info-section">
              <p>User Info:</p>
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </section>}
        </section>

        : isLoading ?
          <Loading message="Generating token..." /> :
          <Button className="m-auto" onClick={loginWithRedirect}>
            Log in to generate your access token.
          </Button>
      }
    </section>
  );
}

export default AuthDebugger
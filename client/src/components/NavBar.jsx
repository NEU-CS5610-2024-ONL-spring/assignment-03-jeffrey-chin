import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { Dropdown } from "react-bootstrap";
import '../css/NavBar.css';

function NavBar() {
    const { loginWithRedirect, isAuthenticated, isLoading, user, logout } = useAuth0();

    return (
        <nav className="menu">
            <ul className="menu-items">
                <li>
                    <Link to="/">
                        <img src="../home_icon192.jpeg" alt="home icon" width="50px" height="50px" />
                    </Link>
                </li>
                <li>
                    {!isLoading && (
                        isAuthenticated ?
                            <p className="m-auto">Welcome, {user.name}!</p> :
                            <p className="m-auto">LibraryApp</p>
                    )}
                </li>
                <li className="dropdown">
                    <Dropdown>
                        <Dropdown.Toggle>Menu</Dropdown.Toggle>
                        {!isLoading && (
                            isAuthenticated ?
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/">Home</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/search">Search books</Dropdown.Item>
                                    <Dropdown.Item onClick={() => logout({ returnTo: window.location.origin })}>Log out</Dropdown.Item>
                                </Dropdown.Menu>
                                :
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/">Home</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/search">Search books</Dropdown.Item>
                                    <Dropdown.Item onClick={loginWithRedirect}>Log in</Dropdown.Item>
                                    <Dropdown.Item onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}>Register</Dropdown.Item>
                                </Dropdown.Menu>
                        )}
                    </Dropdown>
                </li>
            </ul>
        </nav>
    )
}

export default NavBar
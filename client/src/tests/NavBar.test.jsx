import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from "../components/NavBar";

jest.mock("@auth0/auth0-react", () => ({
    ...jest.requireActual('@auth0/auth0-react'),
    useAuth0: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
}));

describe("NavBar Component Tests", () => {
    const mockUser = {
        name: "test user",
        email: "testuser@example.com",
        sub: "auth0|123456",
        email_verified: true,
    }

    test("Display the expected NavBar when a user is logged in", () => {
        const mockLogout = jest.fn();

        useAuth0.mockReturnValue({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            logout: mockLogout,
        });

        render(
            <BrowserRouter>
                <NavBar />
            </BrowserRouter>
        );

        const image = screen.getByAltText("home icon");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "../home_icon192.jpeg");
        expect(image).toHaveAttribute("height", "50px");
        expect(image).toHaveAttribute("width", "50px");

        expect(screen.getByText("Welcome, test user!")).toBeInTheDocument();

        const menu = screen.getByText("Menu");
        expect(menu).toBeInTheDocument();
        waitFor(() => {
            fireEvent.click(menu);
        })

        const homeLink = screen.getByText("Home");
        const profileLink = screen.getByText("Profile");
        const searchBooksLink = screen.getByText("Search books");
        const logOutLink = screen.getByText("Log out");

        expect(homeLink).toBeInTheDocument();
        expect(profileLink).toBeInTheDocument();
        expect(searchBooksLink).toBeInTheDocument();
        expect(logOutLink).toBeInTheDocument();

        waitFor(() => {
            fireEvent.click(homeLink);
        })
        expect(window.location.pathname).toBe("/");

        waitFor(() => {
            fireEvent.click(profileLink);
        })
        expect(window.location.pathname).toBe("/profile");

        waitFor(() => {
            fireEvent.click(searchBooksLink);
        })
        expect(window.location.pathname).toBe("/search");

        waitFor(() => {
            fireEvent.click(logOutLink);
        })
        expect(mockLogout).toHaveBeenCalledWith({
            returnTo: window.location.origin,
        });
    });

    test("Display the expected NavBar when a user is not logged in", () => {
        const mockLoginWithRedirect = jest.fn();

        useAuth0.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            loginWithRedirect: mockLoginWithRedirect,
        });

        render(
            <BrowserRouter>
                <NavBar />
            </BrowserRouter>
        );

        const image = screen.getByAltText("home icon");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "../home_icon192.jpeg");
        expect(image).toHaveAttribute("height", "50px");
        expect(image).toHaveAttribute("width", "50px");

        expect(screen.getByText("LibraryApp")).toBeInTheDocument();

        const menu = screen.getByText("Menu");
        expect(menu).toBeInTheDocument();
        waitFor(() => {
            fireEvent.click(menu);
        })

        const homeLink = screen.getByText("Home");
        const searchBooksLink = screen.getByText("Search books");
        const loginLink = screen.getByText("Log in");
        const registerLink = screen.getByText("Register");

        expect(homeLink).toBeInTheDocument();
        expect(searchBooksLink).toBeInTheDocument();
        expect(loginLink).toBeInTheDocument();
        expect(registerLink).toBeInTheDocument();

        waitFor(() => {
            fireEvent.click(homeLink);
        })
        expect(window.location.pathname).toBe("/");

        waitFor(() => {
            fireEvent.click(searchBooksLink);
        })
        expect(window.location.pathname).toBe("/search");

        waitFor(() => {
            fireEvent.click(loginLink);
        })
        expect(mockLoginWithRedirect).toHaveBeenCalled();

        waitFor(() => {
            fireEvent.click(registerLink);
        })
        expect(mockLoginWithRedirect).toHaveBeenCalledWith({
            authorizationParams: {
                screen_hint: 'signup',
            }
        });
    });
});
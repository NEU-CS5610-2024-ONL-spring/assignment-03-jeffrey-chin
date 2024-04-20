import React, { useContext, useState, useEffect } from 'react';
import { useAuthToken } from "./AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";

const UserContext = React.createContext();

function UserProvider({ children }) {
    const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
    const { accessToken } = useAuthToken();
    const [user, setUser] = useState();

    async function getUserInfo() {
        if (isAuthenticated && accessToken) {
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
    }

    async function updateUserInfo(age, gender, favoriteBook, favoriteAuthor, currentlyReading) {
        if (!accessToken) {
            loginWithRedirect();
            return;
        }

        const request = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                age,
                gender,
                favoriteBook,
                favoriteAuthor,
                currentlyReading,
            })
        });

        if (request.ok) {
            const user = await request.json();
            setUser(user);
            return user;
        } else {
            return null;
        }
    }

    async function deleteUser() {
        if (isAuthenticated && accessToken) {
            const request = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (request.ok) {
                const user = await request.json();
                logout({ returnTo: window.location.origin });
                return user;
            } else {
                return null;
            }
        }
    }

    useEffect(() => {
        getUserInfo();
    }, [isAuthenticated, accessToken])

    return (
        <UserContext.Provider value={{ user, updateUserInfo, deleteUser }}>
            {children}
        </UserContext.Provider>
    );
}

const useUser = () => useContext(UserContext);

export { useUser, UserProvider };
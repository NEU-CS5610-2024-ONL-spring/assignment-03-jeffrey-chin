import React, { useContext, useState, useEffect } from 'react';
import { useAuthToken } from "./AuthTokenContext";
import { useAuth0 } from "@auth0/auth0-react";

const UserBooksContext = React.createContext();

function UserBooksProvider({ children }) {
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const { accessToken } = useAuthToken();
    const [userBooks, setUserBooks] = useState([]);

    async function fetchUserBooks() {
        if (isAuthenticated && accessToken) {
            const request = await fetch(`${process.env.REACT_APP_API_URL}/user-books`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (request.ok) {
                const books = await request.json();
                setUserBooks(books);
                return books;
            } else {
                return null;
            }
        }
    }

    async function addUserBook(title, authors, coverImageURL, olid) {
        if (!accessToken) {
            loginWithRedirect();
            return;
        }

        const request = await fetch(`${process.env.REACT_APP_API_URL}/user-books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                title,
                authors,
                coverImageURL,
                olid,
            }),
        });

        if (request.ok) {
            const book = await request.json();
            setUserBooks(books => [book, ...books])
            return book;
        } else {
            return null;
        }
    }

    async function updateUserBook(userBookID, rating) {
        if (!accessToken) {
            loginWithRedirect();
            return;
        }

        const request = await fetch(`${process.env.REACT_APP_API_URL}/user-books/${userBookID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                rating,
            })
        });

        if (request.ok) {
            const userBook = await request.json();
            const updatedUserBooks = userBooks.map(book => {
                if (book.id === userBook.id) { // Only update the modified user-book
                    return { ...book, rating: rating };
                }
                return book;
            });

            setUserBooks(updatedUserBooks);
            return userBook;
        } else {
            return null;
        }
    }

    async function deleteUserBook(userBookID) {
        if (!accessToken) {
            loginWithRedirect();
            return;
        }
        
        const request = await fetch(`${process.env.REACT_APP_API_URL}/user-books/${userBookID}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (request.ok) {
            const userBook = await request.json();
            setUserBooks(books => books.filter(book => book.id !== userBook.id));
            return userBook;
        } else {
            return null;
        }
    }

    useEffect(() => {
        fetchUserBooks();
    }, [isAuthenticated, accessToken])

    return (
        <UserBooksContext.Provider value={{ userBooks, addUserBook, updateUserBook, deleteUserBook }}>
            {children}
        </UserBooksContext.Provider>
    );
}

const useUserBooks = () => useContext(UserBooksContext);

export { useUserBooks, UserBooksProvider };
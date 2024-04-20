import { React } from 'react';
import { Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserBooks } from '../UserBooksContext';
import { useEffect, useState } from 'react';
import Loading from './Loading';

function SearchResults({ results, query, isFetchingResults }) {
    const { userBooks, addUserBook, deleteUserBook } = useUserBooks();
    const [addedBooks, setAddedBooks] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (userBooks && results.length > 0) {
            setAddedBooks(getAddedBooksByOLID(userBooks, results));
        }
    }, [userBooks, results])

    return (
        <section className={location.pathname === "/search" ? "search-results-page" : "search-results"}>
            <h2>Search results for "{query}":</h2>
            <ul>
                {results.length > 0 ? results.map(result => (
                    <li key={result.key}>
                        <BookResult book={result} />
                        {addedBooks && (addedBooks[getOLID(result.key)] ? // If the OLID of the result corresponds to a book in the user's added books (the user has added this book)
                            <Button variant="danger" onClick={() => deleteUserBook(addedBooks[getOLID(result.key)])}>
                                Remove from Library
                            </Button> :
                            <Button onClick={() => addUserBook(result.title, joinAuthors(result.author_name), getCoverURL(result.cover_i), getOLID(result.key))}>
                                Add to Library
                            </Button>
                        )}
                        <Button onClick={() => navigate("/details/" + getOLID(result.key))}>
                            Details
                        </Button>
                    </li>
                )) : isFetchingResults ?
                    <Loading message="Loading results..." /> :
                    <p>No results found.</p>}
            </ul>
        </section>
    )
}

function getCoverURL(coverID) {
    if (coverID) {
        return `https://covers.openlibrary.org/b/id/${coverID}-M.jpg`;
    } else {
        return "";
    }
}

function getOLID(key) {
    return key.replace(/^\/works\//, ''); // the book key contains the OLID, but the /works/ prefix is not needed
}

function getAddedBooksByOLID(userBooksArray, resultsArray) {
    let userBookIDs = {};
    let addedBooksMap = {};

    // Populate userBookIDs with IDs (keyed by olid) from userBooksArray
    for (const userBook of userBooksArray) {
        userBookIDs[userBook.book.olid] = userBook.id;
    }

    // Iterate through the search results
    for (const book of resultsArray) {
        const olid = getOLID(book.key);
        if (userBookIDs[olid]) { // If the OLID of the result corresponds to an ID in userBookIDs (the user has added this book)
            addedBooksMap[olid] = userBookIDs[olid]; // Add the ID of the result to addedBooksMap
        }
    }

    return addedBooksMap;
}

function BookResult({ book }) {
    return (
        <section>
            <h2>{book.title}</h2>
            <p>{joinAuthors(book.author_name)}</p>
            {book.cover_i ?
                <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt="Cover image" height="200px" /> :
                <p>No cover image available for this book.</p>}
        </section>
    )
}

function joinAuthors(authors) {
    if (authors) {
        return authors.join(", ");
    } else {
        return "No authors found for this book.";
    }
}

export default SearchResults
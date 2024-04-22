import { useState, useEffect, React } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import NotFound from './NotFound';
import Loading from './Loading';
import '../css/BookDetails.css';

function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    async function fetchBookDetails(id) {
        const request = await fetch("https://openlibrary.org/search.json?q=" + id, {
            method: "GET"
        });

        if (request.ok) {
            const data = await request.json();

            if (data.numFound !== 0) {
                for (const book of data.docs) {
                    if (book.key.includes(id)) { // to ensure the book matches the id (in case multiple books are returned)
                        setBook(truncateBookFields(book));
                        break;
                    }
                }
            }
            setIsLoading(false);
            return (data);
        } else {
            return null;
        }
    }

    function truncateBookFields(book) {
        const result = {};
        for (const key in book) {
            if (Array.isArray(book[key]) && book[key].length >= 30) {
                result[key] = book[key].slice(0, 30); // limit fields to less than 30 items (to improve readability)
                result[key].push("...");
            } else {
                result[key] = book[key];
            }
        }

        if (result["subject"]) { // Check if the subject field exists
            // Only keep subjects with letters, spaces, and common symbols:
            result["subject"] = result["subject"].filter(subject => /^[a-zA-Z\s-'&()/,]+$/.test(subject));
        }

        return result;
    }

    useEffect(() => {
        if ((/^OL\d+/).test(id)) { // If the URL ID is a valid OLID ("OL" + a number)
            fetchBookDetails(id);
        } else {
            navigate("/details"); // displays the not found page
        }
    }, []);

    return (
        <>
            <NavBar />
            <header>
                <h2>Book Details</h2>
            </header>
            {book ? (
                <table>
                    <tbody>
                        <tr>
                            <td>Cover:</td>
                            {book.cover_i ?
                                <td className="img-td">
                                    <img src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`} alt="Cover image" />
                                </td> : <td>Cover unavailable.</td>}
                        </tr>
                        <tr>
                            <td>Title:</td>
                            <td>{book.title ? book.title : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>Author(s):</td>
                            <td>{book.author_name ? book.author_name.join(", ") : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>ISBN:</td>
                            <td>
                                {book.isbn ?
                                    <>
                                        {book.isbn[0]}{' '}
                                        (Search on {' '}
                                        <a href={`https://www.amazon.com/search/s?k=${book.isbn[0]}`} target="_blank" rel="noopener noreferrer">Amazon</a>{', '}
                                        <a href={`https://search.worldcat.org/search?q=${book.isbn[0]}`} target="_blank" rel="noopener noreferrer">WorldCat</a>)
                                    </> : "Unknown"}
                            </td>
                        </tr>
                        <tr>
                            <td>Publisher(s):</td>
                            <td>{book.publisher ? book.publisher.join(", ") : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>Date(s) of publication:</td>
                            <td>{book.publish_date ? book.publish_date.join(", ") : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>Place(s) of publication:</td>
                            <td>{book.publish_place ? book.publish_place.join(", ") : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>First publish year:</td>
                            <td>{book.first_publish_year ? book.first_publish_year : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>Number of pages:</td>
                            <td>{book.number_of_pages_median ? book.number_of_pages_median : "Unknown"}</td>
                        </tr>
                        <tr>
                            <td>Subject(s): </td>
                            <td>{(book.subject && book.subject.length > 0) ? book.subject.join(", ") : "Unknown"}</td>
                        </tr>
                    </tbody>
                </table>
            ) : isLoading ? <Loading message="Loading book details..." /> : <NotFound message={`Book with ID ${id} not found.`} />}
        </>
    )
}

export default BookDetails
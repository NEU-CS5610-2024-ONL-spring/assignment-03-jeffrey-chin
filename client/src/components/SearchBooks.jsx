import { useState, useEffect, React } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, InputGroup } from 'react-bootstrap';
import SearchResults from './SearchResults';
import NavBar from './NavBar';
import "../css/SearchForm.css";

function SearchBooks({ formLabel }) {
    const location = useLocation();
    const navigate = useNavigate();
    const criteria = new URLSearchParams(location.search).get('criteria');
    const [results, setResults] = useState([]);
    const [query, setQuery] = useState(criteria ? criteria : "");
    const [isFetchingResults, setIsFetchingResults] = useState(false);

    function SearchForm() {
        const [validated, setValidated] = useState(false);
        const [searchText, setSearchText] = useState(query);

        const handleSubmit = (event) => {
            event.preventDefault();
            const form = event.currentTarget;

            if (form.checkValidity() === false) {
                event.stopPropagation();
            } else {
                if (location.pathname === "/") {
                    navigate("/search?criteria=" + searchText);
                } else {
                    setResults([]);
                    setQuery(searchText);
                    setIsFetchingResults(true);
                    if (location.pathname !== "/profile") { // The user may be on the homepage, in which case searching would direct the user to the search page
                        navigate("/search?criteria=" + searchText);
                    }
                    fetchBooks(searchText);
                };
            }

            setValidated(true);
        };

        function validateInput(input) {
            if (!input.trim() || // To prevent users from submitting a search string with only whitespaces
                !/^[a-zA-Z0-9\s'".,-]*$/.test(input)) { // Only allow input with alphanumeric characters and common symbols
                return false;
            }
            return true;
        }

        return (
            <Form noValidate validated={validated} onSubmit={handleSubmit} className="form">
                {formLabel ? formLabel : <Form.Label htmlFor="search">Enter a book title:</Form.Label>}
                <InputGroup>
                    <Form.Control
                        type="search"
                        id="search"
                        placeholder="Enter a title..."
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            if (!validateInput(e.target.value)) {
                                e.target.setCustomValidity("Please provide an alphanumeric book title.");
                            } else {
                                e.target.setCustomValidity("");
                            }
                        }}
                        maxLength={200}
                        required
                    />
                    <Button variant="primary" id="search-button" type="submit">
                        Search
                    </Button>
                    <Form.Control.Feedback tooltip type="invalid">Please provide an alphanumeric book title.</Form.Control.Feedback>
                </InputGroup>
            </Form>
        )
    }

    async function fetchBooks(title) {
        const request = await fetch("https://openlibrary.org/search.json?title=" + title + "&limit=20&fields=key,title,author_name,cover_i", {
            method: "GET"
        });

        if (request.ok) {
            const data = await request.json();
            setResults(data.docs);
            setIsFetchingResults(false);

            if (location.pathname !== "/profile" && data.docs.length === 0) { // If the user is not on the profile page and no results are returned
                navigate("/search");
            }
            return data;
        } else {
            return null;
        }
    }

    useEffect(() => {
        if (criteria) {
            setIsFetchingResults(true);
            fetchBooks(criteria);
        }
    }, []);

    return (
        <div>
            {location.pathname === "/search" && <NavBar /> /* Some uses of the SearchBooks component are contained within a Modal and do not need a NavBar */}
            <SearchForm />
            {query && (<SearchResults results={results} query={query} isFetchingResults={isFetchingResults} />)}
        </div>
    )
}

export default SearchBooks
import { useState, useEffect, React } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserBooks } from "../UserBooksContext";
import { Form } from "react-bootstrap";
import SearchBooks from './SearchBooks';
import NavBar from "./NavBar";
import UserBooksTable from "./UserBooksTable";
import "../css/Home.css";

export default function Home() {
  const { isLoading, isAuthenticated } = useAuth0();
  const { userBooks } = useUserBooks();
  const [componentLoaded, setComponentLoaded] = useState(false);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState();
  const [tableHeader, setTableHeader] = useState();
  const [tableIsLoading, setTableIsLoading] = useState(true);

  async function fetchRecentlyAddedBooks() {
    if (isAuthenticated) { // If the user is logged in, the user's recently added books are to be displayed
      setTableHeader("Your recently added books:");
      setRecentlyAddedBooks(userBooks);
      setTableIsLoading(false);
      return;
    }

    const request = await fetch(`${process.env.REACT_APP_API_URL}/recently-added-books`, {
      method: "GET",
    });

    if (request.ok) {
      const books = await request.json();
      setTableHeader("Recently added by others:");
      setRecentlyAddedBooks(books);
      setTableIsLoading(false);
      return books;
    } else {
      return null;
    }
  }

  useEffect(() => {
    if (!isLoading) {
      fetchRecentlyAddedBooks();
    }
  }, [isLoading, isAuthenticated, userBooks])

  useEffect(() => {
    setComponentLoaded(true); // to ensure the page is loaded before loading the background image
  }, [])

  return (
    <div>
      <NavBar />
      <SearchBooks formLabel={<Form.Label htmlFor="search" className="home-search-label">Search for your favorite books</Form.Label>} />
      <UserBooksTable header={tableHeader} list={recentlyAddedBooks} tableIsLoading={tableIsLoading} />
      {componentLoaded && (
        <img src="library.jpg" alt="Library" className="background-image" />
      )}
    </div>
  );
}

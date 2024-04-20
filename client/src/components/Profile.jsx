import { useState, React } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Modal } from 'react-bootstrap';
import { useAuth0 } from "@auth0/auth0-react";
import { useUserBooks } from '../UserBooksContext';
import { useUser } from '../UserContext';
import SearchBooks from './SearchBooks';
import Loading from './Loading';
import NavBar from './NavBar';
import UserInfoTable from './UserInfoTable';
import '../css/Profile.css';

// A container for books in a user's library
function BookItemView({ id, title, authors, coverImageURL, olid, rating }) {
    const navigate = useNavigate();

    // For the "update rating" modal:
    const [show, setShow] = useState(false);
    const [selectedRating, setSelectedRating] = useState(5);
    const { updateUserBook, deleteUserBook } = useUserBooks();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserBook(id, selectedRating);
        setShow(false);
    }

    const handleDeleteUserBook = () => {
        setIsProcessing(true);
        deleteUserBook(id);
    }

    return (
        <section>
            <h2 className="book-header">{title}</h2>

            <p>{authors}</p>

            {coverImageURL ?
                <>
                    <img src={coverImageURL} alt="Cover image" height="200" />
                    <br />
                </> :
                <p>No cover available for this book.</p>}

            {rating ?
                <p>Your rating: {rating}/5
                    <Link onClick={handleShow}>Update</Link>
                </p> : 
                <Button variant="outline-dark mt-2" onClick={handleShow}>Rate</Button>}

            <Button variant="outline-primary mt-2" onClick={() => navigate("/details/" + olid)}>
                Details
            </Button>

            <Button variant="outline-danger mt-2" onClick={handleDeleteUserBook} disabled={isProcessing}>
                Remove
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Your Rating</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => handleSubmit(e)}>
                        <Form.Label htmlFor="rating">Select a rating</Form.Label>
                        <Form.Select id="rating" defaultValue={rating} onChange={(e) => setSelectedRating(e.target.value)}>
                            <option value={5}>5/5</option>
                            <option value={4}>4/5</option>
                            <option value={3}>3/5</option>
                            <option value={2}>2/5</option>
                            <option value={1}>1/5</option>
                        </Form.Select>
                        <Button type="submit" className="d-flex mt-3 ms-auto">Submit</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </section>
    )
}

function BookItems({ list }) {
    return (
        <ul>
            {list.map(userBook => (
                <li key={userBook.id}>
                    <BookItemView id={userBook.id} title={userBook.book.title} authors={userBook.book.authors} coverImageURL={userBook.book.coverImageURL} olid={userBook.book.olid} rating={userBook.rating} />
                </li>
            ))}
        </ul>
    )
}

function Profile() {
    const { isLoading, logout } = useAuth0();
    const { userBooks } = useUserBooks();
    const { deleteUser } = useUser();
    const [showSearch, setShowSearch] = useState(false);
    const [showDeleteUser, setShowDeleteUser] = useState(false);

    const handleCloseSearch = () => setShowSearch(false);
    const handleShowSearch = () => setShowSearch(true);

    const handleCloseDeleteUser = () => setShowDeleteUser(false);
    const handleShowDeleteUser = () => setShowDeleteUser(true);

    const handleDeleteUser = () => {
        logout({ returnTo: window.location.origin });
        deleteUser();
    }

    return (
        <div>
            <NavBar />
            <header>
                <h1>Profile</h1>
            </header>
            <section>
                <h2>About you:</h2>
                <UserInfoTable />
            </section>
            <hr />
            <section className="your-library">
                <h2>Your library</h2>
                {isLoading ? <Loading message="Loading your library..." /> :
                    userBooks &&
                    (userBooks.length > 0 ?
                        <BookItems list={userBooks} /> :
                        <p>Your library is empty.</p>)}

                <Button onClick={handleShowSearch}>
                    Add a book
                </Button>
            </section>
            <hr />
            <section>
                <h2>Your account</h2>
                <Button variant="danger mb-3" onClick={handleShowDeleteUser}>
                    Delete account
                </Button>
            </section>

            <Modal show={showSearch} onHide={handleCloseSearch}>
                <Modal.Header closeButton>
                    <Modal.Title>Search Books</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SearchBooks />
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteUser} onHide={handleCloseDeleteUser}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete your account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you wish to delete your account? Your library and all personal information will be deleted.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteUser}>Cancel</Button>
                    <Button onClick={handleDeleteUser}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Profile
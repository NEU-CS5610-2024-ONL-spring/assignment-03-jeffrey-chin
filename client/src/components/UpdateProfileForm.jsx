import { useState, React } from 'react';
import { useUser } from '../UserContext';
import { Form, Button, InputGroup } from 'react-bootstrap';

function UpdateProfileForm({ handleCloseUpdate }) {
    const { updateUserInfo } = useUser();
    const [validated, setValidated] = useState(false);
    const [age, setAge] = useState();
    const [gender, setGender] = useState();
    const [favoriteBook, setFavoriteBook] = useState();
    const [favoriteAuthor, setFavoriteAuthor] = useState();
    const [currentlyReading, setCurrentlyReading] = useState();

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            updateUserInfo(age, gender, favoriteBook, favoriteAuthor, currentlyReading);
            handleCloseUpdate();
        }

        setValidated(true);
    };

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit} className="form">
            <Form.Label htmlFor="age">Enter your age:</Form.Label>
            <InputGroup>
                <Form.Control
                    type="number"
                    id="age"
                    placeholder="Your age..."
                    onChange={(e) => {
                        setAge(e.target.value);
                    }}
                    min={1}
                    max={200}
                    required
                />
                <Form.Control.Feedback tooltip type="invalid">Please provide a valid age.</Form.Control.Feedback>
            </InputGroup>

            <Form.Label htmlFor="gender">Enter your gender:</Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    id="gender"
                    placeholder="Your gender..."
                    onChange={(e) => {
                        setGender(e.target.value);
                    }}
                    maxLength={100}
                    required
                />
                <Form.Control.Feedback tooltip type="invalid">Please enter a gender.</Form.Control.Feedback>
            </InputGroup>

            <Form.Label htmlFor="favoriteBook">What is your favorite book?</Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    id="favoriteBook"
                    placeholder="Your favorite book..."
                    onChange={(e) => {
                        setFavoriteBook(e.target.value);
                    }}
                    maxLength={100}
                    required
                />
                <Form.Control.Feedback tooltip type="invalid">Please enter your favorite book.</Form.Control.Feedback>
            </InputGroup>

            <Form.Label htmlFor="favoriteAuthor">Who is your favorite author?</Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    id="favoriteAuthor"
                    placeholder="Your favorite author..."
                    onChange={(e) => {
                        setFavoriteAuthor(e.target.value);
                    }}
                    maxLength={100}
                    required
                />
                <Form.Control.Feedback tooltip type="invalid">Please enter your favorite author.</Form.Control.Feedback>
            </InputGroup>

            <Form.Label htmlFor="currentlyReading">What are you currently reading?</Form.Label>
            <InputGroup>
                <Form.Control
                    type="text"
                    id="currentlyReading"
                    placeholder="I'm currently reading..."
                    onChange={(e) => {
                        setCurrentlyReading(e.target.value);
                    }}
                    maxLength={100}
                    required
                />
                <Form.Control.Feedback tooltip type="invalid">Please enter what you are currently reading.</Form.Control.Feedback>
            </InputGroup>

            <Button className="mt-3" variant="primary" id="update-profile" type="submit">
                Update
            </Button>
        </Form>
    )
}

export default UpdateProfileForm
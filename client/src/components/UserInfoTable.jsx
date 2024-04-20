import { useState, React } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useUser } from '../UserContext';
import { Button, Modal } from 'react-bootstrap';
import UpdateProfileForm from './UpdateProfileForm';
import Loading from './Loading';
import "../css/UserInfoTable.css";

function UserInfoTable() {
    const { user } = useUser();
    const { isLoading, user: auth0User } = useAuth0();
    const [showUpdate, setShowUpdate] = useState(false);

    const handleCloseUpdate = () => setShowUpdate(false);
    const handleShowUpdate = () => setShowUpdate(true);

    return isLoading ? <Loading message="Loading your profile..." /> : user && (
        <>
            <table className="user-info-table">
                <tbody>
                    <tr>
                        <td>Username: {auth0User.name}</td>
                    </tr>
                    <tr>
                        <td>Email: {auth0User.email}</td>
                    </tr>
                    <tr>
                        <td>Age: {user.age}</td>
                    </tr>
                    <tr>
                        <td>Gender: {user.gender}</td>
                    </tr>
                    <tr>
                        <td>Favorite book: {user.favoriteBook}</td>
                    </tr>
                    <tr>
                        <td>Favorite author: {user.favoriteAuthor}</td>
                    </tr>
                    <tr>
                        <td>Currently reading: {user.currentlyReading}</td>
                    </tr>
                </tbody>
            </table>
            
            <Button onClick={handleShowUpdate}>
                Update profile
            </Button>

            <Modal show={showUpdate} onHide={handleCloseUpdate}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UpdateProfileForm handleCloseUpdate={handleCloseUpdate} />
                </Modal.Body>
            </Modal>
        </>
    )
}

export default UserInfoTable
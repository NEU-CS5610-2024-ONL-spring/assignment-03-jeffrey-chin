import React from 'react';
import { Link } from 'react-router-dom';
import Loading from './Loading';
import "../css/UserBooks.css";

function UserBooksTable({ header, list, tableIsLoading }) {
    return (
        <table>
            <thead className="user-books-head">
                <tr>
                    <th>{header}</th>
                </tr>
            </thead>
            <tbody className="user-books-body">
                <tr>
                    <td>Cover</td>
                    <td>Title</td>
                    <td>Author(s)</td>
                    <td>User</td>
                    <td>Rating</td>
                </tr>
                {list && list.length > 0 ? list.map(userBook => (
                    <tr key={userBook.book.id}>
                        {userBook.book.coverImageURL ?
                            <td className="img-td">
                                <Link to={`/details/${userBook.book.olid}`}>
                                    <img src={userBook.book.coverImageURL} alt="Cover image" height="58px" />
                                </Link>
                            </td> :
                            <td>
                                <Link to={`/details/${userBook.book.olid}`}>
                                    Book Details
                                </Link>
                            </td>}
                        <td>
                            <em>{userBook.book.title}</em>
                        </td>
                        <td>
                            {userBook.book.authors}
                        </td>
                        <td>
                            {userBook.user.name}
                        </td>
                        <td>
                            {userBook.rating && <>{userBook.rating}/5</>}
                        </td>
                    </tr>
                )) : tableIsLoading ?
                    <tr>
                        <td colSpan="5"><Loading message="Loading recently added books..." /></td>
                    </tr> :
                    <tr>
                        <td colSpan="5" align="center">No books found.</td>
                    </tr>}
            </tbody>
        </table>
    )
}

export default UserBooksTable
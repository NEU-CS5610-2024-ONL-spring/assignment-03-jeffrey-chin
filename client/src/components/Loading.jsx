import React from 'react';
import { Spinner } from 'react-bootstrap';
import "../css/Loading.css";

function Loading({ message }) {
    return (
        <figure className="loading-figure">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading</span>
            </Spinner>
            <figcaption>{message}</figcaption>
        </figure>
    )
}

export default Loading
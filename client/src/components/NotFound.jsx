import React from 'react';
import "../css/NotFound.css";

function NotFound({ message }) {
  return (
    <div className="not-found-container">
      {message ? message : <p>The page you requested was not found.</p>}
    </div>
  )
}

export default NotFound
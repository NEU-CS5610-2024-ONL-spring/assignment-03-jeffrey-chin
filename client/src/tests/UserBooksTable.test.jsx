import React from "react";
import { render, screen } from "@testing-library/react";
import UserBooksTable from "../components/UserBooksTable";
import { useUserBooks } from '../UserBooksContext';
import { BrowserRouter } from 'react-router-dom';

jest.mock("../UserBooksContext", () => ({
    ...jest.requireActual('../UserBooksContext'),
    useUserBooks: jest.fn().mockReturnValue({
        userBooks: [
            {
                "id": 231,
                "userId": 30,
                "bookId": 121,
                "rating": null,
                "user": {
                    "name": "Jeffrey Chin"
                },
                "book": {
                    "id": 121,
                    "title": "Fruits Basket, Vol. 13",
                    "authors": "Natsuki Takaya",
                    "coverImageURL": "https://covers.openlibrary.org/b/id/874234-M.jpg",
                    "olid": "OL5855306W"
                }
            },
            {
                "id": 230,
                "userId": 30,
                "bookId": 120,
                "rating": null,
                "user": {
                    "name": "Jeffrey Chin",
                },
                "book": {
                    "id": 120,
                    "title": "Fruits basket",
                    "authors": "Natsuki Takaya",
                    "coverImageURL": "https://covers.openlibrary.org/b/id/12880296-M.jpg",
                    "olid": "OL20042168W"
                }
            },
            {
                "id": 229,
                "userId": 30,
                "bookId": 119,
                "rating": null,
                "user": {
                    "name": "Jeffrey Chin",
                },
                "book": {
                    "id": 119,
                    "title": "Fruits basket Vol 1",
                    "authors": "Natsuki Takaya",
                    "coverImageURL": "https://covers.openlibrary.org/b/id/6932408-M.jpg",
                    "olid": "OL16041237W"
                }
            }
        ]
    })
}));

describe("UserBooksTable Component Tests", () => {
    test("Displays the UserBooksTable correctly", () => {
        const mockBooks = useUserBooks().userBooks;

        render(
            <BrowserRouter>
                <UserBooksTable header="Your recently added books:" list={mockBooks} tableIsLoading={false} />
            </BrowserRouter>
        );

        expect(screen.getByText("Your recently added books:")).toBeInTheDocument();

        const cells = screen.getAllByRole('cell');

        const headerRowText = ['Cover', 'Title', 'Author(s)', 'User', 'Rating'];

        for (let i = 0; i < 5; i++) {
            expect(cells[i]).toBeInTheDocument();
            expect(cells[i].textContent).toBe(headerRowText[i]);
        }
        
        const coverCellIndices = [5, 10, 15]; // Store the first cell index (containing the cover) of each row below the 'header' row

        // Ensure correct cover images are displayed
        for (let i = 0; i < coverCellIndices.length; i++) {
            expect(cells[coverCellIndices[i]].querySelector('img')).toBeInTheDocument();
            expect(cells[coverCellIndices[i]].querySelector('img')).toHaveAttribute("src", mockBooks[i].book.coverImageURL);
        }

        // Ensure correct titles are displayed
        for (let i = 0; i < coverCellIndices.length; i++) {
            expect(cells[coverCellIndices[i] + 1]).toBeInTheDocument();
            expect(cells[coverCellIndices[i] + 1].textContent).toBe(mockBooks[i].book.title);
        }

        // Ensure correct authors are displayed
        for (let i = 0; i < coverCellIndices.length; i++) {
            expect(cells[coverCellIndices[i] + 2]).toBeInTheDocument();
            expect(cells[coverCellIndices[i] + 2].textContent).toBe(mockBooks[i].book.authors);
        }

        // Ensure correct usernames are displayed
        for (let i = 0; i < coverCellIndices.length; i++) {
            expect(cells[coverCellIndices[i] + 3]).toBeInTheDocument();
            expect(cells[coverCellIndices[i] + 3].textContent).toBe(mockBooks[i].user.name);
        }

        // Ensure correct ratings are displayed
        for (let i = 0; i < coverCellIndices.length; i++) {
            expect(cells[coverCellIndices[i] + 4]).toBeInTheDocument();
            expect(cells[coverCellIndices[i] + 4].textContent).toBe(mockBooks[i].rating ? mockBooks[i].rating : "");
        }
    });
});
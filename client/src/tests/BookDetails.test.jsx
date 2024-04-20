import React from "react";
import { render, screen, act } from "@testing-library/react";
import { BrowserRouter, useParams } from 'react-router-dom';
import BookDetails from "../components/BookDetails";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ id: 'OL2827199W' }),
}));

describe("BookDetails Component Tests", () => {
    const mockBookDetails = {
        cover_i: 12840573,
        title: "Life of Pi",
        author_name: ['Yann Martel'],
        isbn: ['9781841952451'],
        publisher: ['"Domino"', 'Canongate Books Ltd', 'Clipper Large Print'],
        publish_date: ['July 2004', 'Jul 18, 2009'],
        publish_place: ['Edinburgh', 'Or Yehuda, Israel', 'Barcelona'],
        first_publish_year: 2001,
        number_of_pages_median: 342,
        subject: ['Teenage boys', 'Zoo animals', 'Fiction'],
        key: "/works/OL2827199W"
    };

    beforeEach(() => {
        global.fetch = jest.fn((url, options) => {
            if (
                url === `https://openlibrary.org/search.json?q=${useParams().id}` &&
                options.method === "GET"
            ) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ docs: [mockBookDetails] }),
                });
            }

            return Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
            });
        })
    })

    test("Displays book details correctly", async () => {
        render(
            <BrowserRouter>
                <BookDetails />
            </BrowserRouter>
        );

        await act(async () => { }); // wait for the details to populate

        const fieldLabels = ['Cover:', 'Title:', 'Author(s):', 'ISBN:', 'Publisher(s):', 'Date(s) of publication:', 'Place(s) of publication:', 'First publish year:', 'Number of pages:', 'Subject(s):'];

        // Ensure all cells are displayed
        for (const label of fieldLabels) {
            expect(screen.getByText(label)).toBeInTheDocument();
            expect(screen.getByText(label).nextSibling).toBeInTheDocument();
        }

        const coverImage = screen.queryByAltText("Cover image");
        expect(coverImage).toBeInTheDocument();
        expect(coverImage).toHaveAttribute("src", `https://covers.openlibrary.org/b/id/${mockBookDetails.cover_i}-M.jpg`);
        expect(screen.getByText('Cover:').nextSibling.querySelector('img')).toBe(coverImage);

        expect(screen.getByText('Title:').nextSibling.textContent).toBe(mockBookDetails.title);

        expect(screen.getByText('Author(s):').nextSibling.textContent).toBe(mockBookDetails.author_name.join(", "));

        expect(screen.getByText('ISBN:').nextSibling.textContent).toBe(mockBookDetails.isbn[0] + " (Search on  Amazon, WorldCat)");

        const isbnLinks = screen.getByText('ISBN:').nextSibling.querySelectorAll('a');
        isbnLinks.forEach(link => {
            expect(link).toBeInTheDocument();
            if (link.textContent === "Amazon") {
                expect(link).toHaveAttribute('href', `https://www.amazon.com/search/s?k=${mockBookDetails.isbn[0]}`);
            } else if (link.textContent === "WorldCat") {
                expect(link).toHaveAttribute('href', `https://search.worldcat.org/search?q=${mockBookDetails.isbn[0]}`);
            }
        })

        expect(screen.getByText('Publisher(s):').nextSibling.textContent).toBe(mockBookDetails.publisher.join(", "));

        expect(screen.getByText('Date(s) of publication:').nextSibling.textContent).toBe(mockBookDetails.publish_date.join(", "));

        expect(screen.getByText('Place(s) of publication:').nextSibling.textContent).toBe(mockBookDetails.publish_place.join(", "));

        expect(screen.getByText('First publish year:').nextSibling.textContent).toBe(mockBookDetails.first_publish_year.toString());

        expect(screen.getByText('Number of pages:').nextSibling.textContent).toBe(mockBookDetails.number_of_pages_median.toString());

        expect(screen.getByText('Subject(s):').nextSibling.textContent).toBe(mockBookDetails.subject.join(", "));
    });
});
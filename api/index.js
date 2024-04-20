import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// add your endpoints below this line

// Get the logged-in user
app.get("/user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (user) {
      res.json(user);
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Find an existing user or create one if not in the database
app.post("/verify-user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
    const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
    const maxStringLength = 500;

    if (auth0Id.length > maxStringLength || email.length > maxStringLength || name.length > maxStringLength) {
      res.status(400).send("User fields cannot exceed 500 characters.");
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (user) {
      res.json(user);
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          auth0Id,
          name,
        },
      });

      res.json(newUser);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get all books in a user's library
app.get("/user-books", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (user) {
      const userBooks = await prisma.userBook.findMany({
        where: {
          userId: user.id,
        },
        orderBy: { // order by recently added items first
          id: 'desc',
        },
        include: {
          user: true,
          book: true,
        },
      });
      res.json(userBooks);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// Public endpoint to get recently added books
app.get("/recently-added-books", async (req, res) => {
  try {
    const recentlyAddedBooks = await prisma.userBook.findMany({
      take: 10, // limit books to 10 or less
      orderBy: {
        id: 'desc',
      },
      include: {
        user: true,
        book: true,
      },
    });

    res.json(recentlyAddedBooks.map(({ user: user, book: book, rating: rating }) => ({ user, book, rating })));
  } catch (error) {
    res.status(500).send(error.message);
  }
})

// Create a user book
app.post("/user-books", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { title, authors, coverImageURL, olid } = req.body;

    if (!olid) {
      res.status(400).send("OLID is missing.");
      return;
    }

    if (!(/^OL\d+/).test(olid)) { // OLID validation
      res.status(400).send("OLID must match the format \"OL\" followed by a number.");
      return;
    }

    let book = await prisma.book.findFirst({
      where: {
        olid,
      },
    });

    if (!book) {
      // If the user is adding a new book, validate the rest of the fields in the body:
      if (!title) {
        res.status(400).send("Please provide the title of this book.");
        return;
      }

      if (!authors) {
        res.status(400).send("Please provide the author(s) of this book.");
        return;
      }

      // Ensure cover image URLs are sourced from OpenLibrary
      if (!(/^https:\/\/covers\.openlibrary\.org\/b\/id\/\d+-M\.jpg$/).test(coverImageURL) && coverImageURL !== "") { // URL can be empty
        res.status(400).send("Cover image URLs must be of the format \"https://covers.openlibrary.org/b/id/{id}-M.jpg\".");
        return;
      }

      book = await prisma.book.create({
        data: {
          title,
          authors,
          coverImageURL,
          olid,
        },
      })
    }

    const userBook = await prisma.userBook.create({
      data: {
        user: { connect: { auth0Id } },
        book: { connect: { id: book.id } },
      },
      include: {
        user: true,
        book: true,
      },
    })

    res.json(userBook);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// Update a user-book by id
app.put("/user-books/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      res.status(400).send("Rating must be an integer between 1 and 5.");
      return;
    }

    const updatedBook = await prisma.userBook.update({
      where: {
        id,
      },
      data: {
        rating: parseInt(rating),
      }
    });
    res.json(updatedBook);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// Update the profile of the logged-in user
app.put("/user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;
    const { age, gender, favoriteBook, favoriteAuthor, currentlyReading } = req.body;

    if (age < 1 || age > 200) {
      res.status(400).send("Age must be a number between 1 and 200.");
      return;
    }

    if (gender && gender.length > 100 ||
      favoriteBook && favoriteBook.length > 100 ||
      favoriteAuthor && favoriteAuthor.length > 100 ||
      currentlyReading && currentlyReading.length > 100) {
      res.status(400).send("Fields must not exceed 100 characters.");
      return;
    }

    const updatedUser = await prisma.user.update({
      where: {
        auth0Id,
      },
      data: {
        age: parseInt(age),
        gender,
        favoriteBook,
        favoriteAuthor,
        currentlyReading,
      }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// Delete a user book by id (this endpoint also deletes the book if no other users have it in their library)
app.delete("/user-books/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deletedUserBook = await prisma.userBook.delete({
      where: {
        id,
      },
      include: {
        book: true,
      }
    });

    // Find the number of users that have the deleted book
    const deletedBook = await prisma.book.findUnique({
      where: {
        id: deletedUserBook.book.id
      },
      include: {
        bookUsers: true,
      }
    })

    if (deletedBook.bookUsers.length === 0) {
      await prisma.book.delete({
        where: {
          id: deletedBook.id,
        }
      })
    }

    res.json(deletedUserBook);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// Delete a user
app.delete("/user", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    // Include book IDs for deletion of books after the user has been deleted
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        userBooks: {
          select: {
            book: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      // A user's library must be cleared before the user can be deleted
      await prisma.userBook.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Delete the user
      const deletedUser = await prisma.user.delete({
        where: {
          auth0Id,
        },
      });

      // For each deleted book, find its id and the number of users that have the book in their library
      const deletedBookIDs = user.userBooks.map(userBook => userBook.book.id);
      const deletedBooks = await prisma.book.findMany({
        where: {
          id: {
            in: deletedBookIDs,
          },
        },
        include: {
          bookUsers: true,
        }
      });

      // Delete the books that are not stored in any user's library
      const bookIDsToDelete = deletedBooks.filter(book => book.bookUsers.length === 0).map(book => book.id);
      await prisma.book.deleteMany({
        where: {
          id: {
            in: bookIDsToDelete,
          },
        },
      });

      res.json(deletedUser);
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});

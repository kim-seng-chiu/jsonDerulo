const input1 = {
    "book_title": "Catcher in the Rye",
    "published": "1951",
    "writer": "J.D. Salinger",
    "writer_origin": "USA",
    "fiction": true,
    "language": "English",
    "pages": 234
};

const input2 = {
    "title": "Nineteen Eighty-Four",
    "published": "1949",
    "author": {
        "details": {
            "name": "George Orwell",
            "from": "England"
        }
    },
    "fiction": true,
    "language": "English",
    "no-of-pages": 328
};

const input3 = {
    book_title: "Atomic Habits",
    author: "James Clear",
    author_origin: "USA",
    published: 2018,
    fiction: false,
    pages: 320,
    details: {
      genre: "Business & Commerce",
      publisher: "Penguin Publishing Group",
    },
    rating: {
      score: 95,
    },
  };

module.exports = {
    input1,
    input2,
    input3
}
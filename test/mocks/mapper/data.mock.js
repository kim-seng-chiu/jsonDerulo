const input1 = {
    "book_title": "Catcher in the Rye",
    "published": "1951",
    "writer": "J.D. Salinger",
    "fiction": true,
    "language": "English",
    "pages": 234
};

const input2 = {
    "title": "Nineteen Eighty-Four",
    "published": "1949",
    "author": "George Orwell",
    "fiction": true,
    "language": "English",
    "no-of-pages": 328
};

const template = {
    "Title": {
        "type": "string",
        "mapItems": ["book_title"],
        "description": "The title of the book"
    },
    "Author": {
        "type": "string",
        "mapItems": ["writer", "author"],
        "description": "Name of the person who wrote the book"
    },
    "YearPublished": {
        "type": "number",
        "mapItems": ["published"],
        "description": "The year in which the book was first published"
    },
    "IsFiction": {
        "type": "boolean",
        "mapItems": ["fiction"],
        "description": "Describes if the book is fiction"
    },
    "NumberOfPages": {
        "type": "number",
        "mapItems": ["pages", "no-of-pages"],
        "description": "Number of pages in the published book"
    }
};

module.exports = {
    input1,
    input2,
    template
}
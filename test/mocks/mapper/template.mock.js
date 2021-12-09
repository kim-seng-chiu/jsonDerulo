const bookTemplate = {
    "Author": {
        "type": "object",
        "description": "Details of the person who wrote the book",
        "properties": {
            "Name": {
                "type": "string",
                "mapItems": ["writer", "author.details.name","author"],
                "description": "Name of person who wrote the book"
            },
            "Origin": {
                "type": "string",
                "mapItems": ["writer_origin", "author_origin", "author.details.from"],
                "description": "Birthplace of person who wrote the book"
            }
        }
    },
    "OverallRating" : {
        "type": "number",
        "mapItems": ["rating.score"],
        "description": "",
    },
    "AdditionalInfo": {
        "type": "object",
        "description": "",
        "properties": {
            "Genre": {
                "type": "string",
                "mapItems": ["details.genre"]
            },
            "Publisher": {
                "type": "string",
                "mapItems": ["details.publisher"]
            }
        }
    },
    "Title": {
        "type": "string",
        "mapItems": ["book_title", "title"],
        "description": "The title of the book"
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
    },
};

module.exports = {
    bookTemplate
}
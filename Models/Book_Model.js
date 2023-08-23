const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
    book_name: { type: String },
    author: { type: String },
    edition: { type: Number },
    download_link: { type: String },
    categories: { type: String },
    sub_categories: { type: String },
    semester: { type: [String] },
    added_by: { type: String },
    status: { type: Boolean }
})

module.exports = mongoose.model('books', BookSchema)
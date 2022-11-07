const mongoose = require('mongoose')

const QuestionSchema = new mongoose.Schema({
    book_name: { type: String },
    download_link: { type: String },
    categories: { type: String },
    sub_categories: { type: String },
    added_by: { type: String },
    status: { type: Boolean }
})

module.exports = mongoose.model('questions', QuestionSchema)
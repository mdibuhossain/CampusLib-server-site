const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList
} = require('graphql')
const Book = require('../Models/Book_Model')
const User = require('../Models/User_Model')
const Question = require('../Models/Question_Model')
const Syllabus = require('../Models/Syllabus_Model')

const GraphQLSchemaTemplate = {
    _id: { type: GraphQLID },
    book_name: { type: GraphQLString },
    download_link: { type: GraphQLString },
    categories: { type: GraphQLString },
    sub_categories: { type: GraphQLString },
    added_by: { type: GraphQLString },
    status: { type: GraphQLBoolean }
}

// GraphQL Schema
const BookType = new GraphQLObjectType({
    name: 'book',
    fields: () => ({
        ...GraphQLSchemaTemplate,
        author: { type: GraphQLString },
        edition: { type: GraphQLInt }
    })
})
const QuestionType = new GraphQLObjectType({
    name: 'question',
    fields: () => ({
        ...GraphQLSchemaTemplate,
    })
})
const SyllabusType = new GraphQLObjectType({
    name: 'syllabus',
    fields: () => ({
        ...GraphQLSchemaTemplate,
    })
})
const UserType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        _id: { type: GraphQLID },
        displayName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        photoURL: { type: GraphQLString },
        authType: { type: GraphQLString },
        role: { type: GraphQLString }
    })
})


// GraphQL Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        book: {
            type: BookType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Book.findById(args._id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                return Book.find()
            }
        },
        question: {
            type: QuestionType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Question.findById(args._id)
            }
        },
        questions: {
            type: new GraphQLList(QuestionType),
            resolve(parent, args) {
                return Question.find()
            }
        },
        syllabus: {
            type: SyllabusType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Syllabus.findById(args._id)
            }
        },
        allSyllabus: {
            type: new GraphQLList(SyllabusType),
            resolve(parent, args) {
                return Syllabus.find()
            }
        },
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})
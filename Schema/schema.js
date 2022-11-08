const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = require('graphql')
const Book = require('../Models/Book_Model')
const User = require('../Models/User_Model')
const Question = require('../Models/Question_Model')
const Syllabus = require('../Models/Syllabus_Model')

// GraphQL Schema template
const GraphQLSchemaTemplate = {
    _id: { type: GraphQLID },
    book_name: { type: GraphQLString },
    download_link: { type: GraphQLString },
    categories: { type: GraphQLString },
    sub_categories: { type: GraphQLString },
    added_by: { type: GraphQLString },
    status: { type: GraphQLBoolean }
}
const GraphQLSchemaTemplateForBook = {
    ...GraphQLSchemaTemplate,
    author: { type: GraphQLString },
    edition: { type: GraphQLInt }
}
const GraphQLSchemaForUser = {
    _id: { type: GraphQLID },
    displayName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    photoURL: { type: GraphQLString },
    authType: { type: GraphQLString },
    role: { type: GraphQLString, defaultValue: 'regular' }
}

// GraphQL Schema
const BookType = new GraphQLObjectType({
    name: 'book',
    fields: () => ({
        ...GraphQLSchemaTemplateForBook
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
        ...GraphQLSchemaForUser
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
            resolve(parent, args, req) {
                console.log(req.isAuth)
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

// GraphQL Mutation
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Adding or creating
        addBook: {
            type: BookType,
            args: { ...GraphQLSchemaTemplateForBook },
            resolve(parent, args) {
                const newBook = new Book({ ...args })
                return newBook.save()
            }
        },
        addQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const newQuestion = new Question({ ...args })
                return newQuestion.save()
            }
        },
        addSyllabus: {
            type: SyllabusType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const newSyllabus = new Syllabus({ ...args })
                return newSyllabus.save()
            }
        },
        signUp: {
            type: UserType,
            args: { ...GraphQLSchemaForUser },
            resolve(parent, args) {
                const newUser = new User({ ...args })
                return newUser.save()
            }
        },
        // deleting or remove
        deleteBook: {
            type: BookType,
            args: { _id: { type: GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return Book.findByIdAndRemove(args._id)
            }
        },
        deleteQuestion: {
            type: QuestionType,
            args: { _id: { type: GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return Question.findByIdAndRemove(args._id)
            }
        },
        deleteSyllabus: {
            type: SyllabusType,
            args: { _id: { type: GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return Syllabus.findByIdAndRemove(args._id)
            }
        },
        // Updating or editing
        editBook: {
            type: BookType,
            args: { ...GraphQLSchemaTemplateForBook },
            resolve(parent, args) {
                const tmp = { ...args }
                delete tmp._id
                return Book.findByIdAndUpdate(args._id, { $set: tmp }, { new: true })
            }
        },
        editQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const tmp = { ...args }
                delete tmp._id
                return Question.findByIdAndUpdate(args._id, { $set: tmp }, { new: true })
            }
        },
        editSyllabus: {
            type: SyllabusType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const tmp = { ...args }
                delete tmp._id
                return Syllabus.findByIdAndUpdate(args._id, { $set: tmp }, { new: true })
            }
        },
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})
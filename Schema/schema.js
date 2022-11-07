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
    book_name: { type: GraphQLNonNull(GraphQLString) },
    download_link: { type: GraphQLNonNull(GraphQLString) },
    categories: { type: GraphQLNonNull(GraphQLString) },
    sub_categories: { type: GraphQLNonNull(GraphQLString) },
    added_by: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLNonNull(GraphQLBoolean) }
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

// GraphQL Mutation
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
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
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})
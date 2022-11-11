const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
} = require("graphql");
const Book = require("../Models/Book_Model");
const User = require("../Models/User_Model");
const Question = require("../Models/Question_Model");
const Syllabus = require("../Models/Syllabus_Model");
const { ReturnDocument } = require("mongodb");
const { verifyToken } = require("../MiddleWare/isAuth");

// GraphQL Schema template
const GraphQLSchemaTemplate = {
    _id: { type: GraphQLID },
    book_name: { type: GraphQLString },
    download_link: { type: GraphQLString },
    categories: { type: GraphQLString },
    sub_categories: { type: GraphQLString },
    added_by: { type: GraphQLString },
    status: { type: GraphQLBoolean },
};
const GraphQLSchemaTemplateForBook = {
    ...GraphQLSchemaTemplate,
    author: { type: GraphQLString },
    edition: { type: GraphQLInt },
};
const GraphQLSchemaForUser = {
    _id: { type: GraphQLID },
    displayName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    photoURL: { type: GraphQLString },
    authType: { type: GraphQLString },
    role: { type: GraphQLString, defaultValue: "regular" },
};

// GraphQL Schema
const BookType = new GraphQLObjectType({
    name: "book",
    fields: () => ({
        ...GraphQLSchemaTemplateForBook,
    }),
});
const QuestionType = new GraphQLObjectType({
    name: "question",
    fields: () => ({
        ...GraphQLSchemaTemplate,
    }),
});
const SyllabusType = new GraphQLObjectType({
    name: "syllabus",
    fields: () => ({
        ...GraphQLSchemaTemplate,
    }),
});
const UserType = new GraphQLObjectType({
    name: "user",
    fields: () => ({
        ...GraphQLSchemaForUser,
    }),
});
const AdminCheck = new GraphQLObjectType({
    name: "isAdmin",
    fields: () => ({
        isAdmin: { type: GraphQLBoolean },
    }),
});

// GraphQL Query
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        getBook: {
            type: BookType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Book.findById(args._id);
            },
        },
        getBooks: {
            type: new GraphQLList(BookType),
            resolve(parent, args, req) {
                return Book.find();
            },
        },
        getQuestion: {
            type: QuestionType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Question.findById(args._id);
            },
        },
        getQuestions: {
            type: new GraphQLList(QuestionType),
            resolve(parent, args) {
                return Question.find();
            },
        },
        getSyllabus: {
            type: SyllabusType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                return Syllabus.findById(args._id);
            },
        },
        getAllSyllabus: {
            type: new GraphQLList(SyllabusType),
            resolve(parent, args) {
                return Syllabus.find();
            },
        },
        getUser: {
            type: UserType,
            args: { email: { type: GraphQLString } },
            resolve(parent, args) {
                return User.findOne({ email: args.email });
            },
        },
        getUsers: {
            type: new GraphQLList(UserType),
            args: { token: { type: GraphQLString } },
            async resolve(_, args) {
                const decodedEmail = await verifyToken(args.token)
                if (!decodedEmail) {
                    throw new Error("Unauthenticated!")
                }
                const checkUser = await User.findOne({ email: decodedEmail })
                if (checkUser?.email) {
                    return User.find();
                }
                throw new Error("Unauthenticated!")

            },
        },
        isAdmin: {
            type: AdminCheck,
            args: { email: { type: GraphQLString } },
            async resolve(parent, args) {
                const searchedUser = await User.findOne({ email: args.email });
                if (searchedUser?.role === "admin") return { isAdmin: true };
                else return { isAdmin: false };
            },
        },
    },
});

// GraphQL Mutation
const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        // Adding or creating
        addBook: {
            type: BookType,
            args: { ...GraphQLSchemaTemplateForBook },
            resolve(parent, args) {
                const newBook = new Book({ ...args });
                return newBook.save();
            },
        },
        addQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const newQuestion = new Question({ ...args });
                return newQuestion.save();
            },
        },
        addSyllabus: {
            type: SyllabusType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const newSyllabus = new Syllabus({ ...args });
                return newSyllabus.save();
            },
        },
        signUp: {
            type: UserType,
            args: { ...GraphQLSchemaForUser },
            resolve(parent, args) {
                const newUser = new User({ ...args });
                return newUser.save();
            },
        },
        // deleting or remove
        deleteBook: {
            type: BookType,
            args: { _id: { type: GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return Book.findByIdAndRemove(args._id);
            },
        },
        deleteQuestion: {
            type: QuestionType,
            args: { _id: { type: GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return Question.findByIdAndRemove(args._id);
            },
        },
        deleteSyllabus: {
            type: SyllabusType,
            args: { _id: { type: GraphQLNonNull(GraphQLID) } },
            resolve(parent, args) {
                return Syllabus.findByIdAndRemove(args._id);
            },
        },
        // Updating or editing
        editBook: {
            type: BookType,
            args: { ...GraphQLSchemaTemplateForBook },
            resolve(parent, args) {
                const tmp = { ...args };
                delete tmp._id;
                return Book.findByIdAndUpdate(args._id, { $set: tmp }, { new: true });
            },
        },
        editQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const tmp = { ...args };
                delete tmp._id;
                return Question.findByIdAndUpdate(
                    args._id,
                    { $set: tmp },
                    { new: true }
                );
            },
        },
        editSyllabus: {
            type: SyllabusType,
            args: { ...GraphQLSchemaTemplate },
            resolve(parent, args) {
                const tmp = { ...args };
                delete tmp._id;
                return Syllabus.findByIdAndUpdate(
                    args._id,
                    { $set: tmp },
                    { new: true }
                );
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});

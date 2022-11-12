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
const GraphQLSchemaAuth = {
    _id: { type: GraphQLID },
    token: { type: GraphQLString },
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
            resolve(_, args) {
                return Book.findById(args._id);
            },
        },
        getBooks: {
            type: new GraphQLList(BookType),
            resolve(_, args, req) {
                return Book.find();
            },
        },
        getQuestion: {
            type: QuestionType,
            args: { _id: { type: GraphQLID } },
            resolve(_, args) {
                return Question.findById(args._id);
            },
        },
        getQuestions: {
            type: new GraphQLList(QuestionType),
            resolve(_, args) {
                return Question.find();
            },
        },
        getSyllabus: {
            type: SyllabusType,
            args: { _id: { type: GraphQLID } },
            resolve(_, args) {
                return Syllabus.findById(args._id);
            },
        },
        getAllSyllabus: {
            type: new GraphQLList(SyllabusType),
            resolve(_, args) {
                return Syllabus.find();
            },
        },
        getUser: {
            type: UserType,
            args: { email: { type: GraphQLString } },
            resolve(_, args) {
                return User.findOne({ email: args.email });
            },
        },
        getUsers: {
            type: new GraphQLList(UserType),
            args: { token: { type: GraphQLString } },
            async resolve(_, args) {
                const decodedEmail = await verifyToken(args.token);
                if (!decodedEmail) {
                    throw new Error("Unauthenticated!");
                }
                const checkUser = await User.findOne({ email: decodedEmail });
                if (checkUser?.email) {
                    return User.find();
                }
                throw new Error("Unauthenticated!");
            },
        },
        isAdmin: {
            type: AdminCheck,
            args: { email: { type: GraphQLString } },
            async resolve(_, args) {
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
            args: { ...GraphQLSchemaTemplateForBook, ...GraphQLSchemaAuth },
            resolve(_, args) {
                const newBook = new Book({ ...args });
                return newBook.save();
            },
        },
        addQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaTemplate, ...GraphQLSchemaAuth },
            resolve(_, args) {
                const newQuestion = new Question({ ...args });
                return newQuestion.save();
            },
        },
        addSyllabus: {
            type: SyllabusType,
            args: { ...GraphQLSchemaTemplate, ...GraphQLSchemaAuth },
            resolve(_, args) {
                const newSyllabus = new Syllabus({ ...args });
                return newSyllabus.save();
            },
        },
        signUp: {
            type: UserType,
            args: { ...GraphQLSchemaForUser },
            resolve(_, args) {
                const newUser = new User({ ...args });
                return newUser.save();
            },
        },
        // deleting or remove
        deleteBook: {
            type: BookType,
            args: { ...GraphQLSchemaAuth },
            resolve(_, args) {
                return Book.findByIdAndRemove(args._id);
            },
        },
        deleteQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaAuth },
            resolve(_, args) {
                return Question.findByIdAndRemove(args._id);
            },
        },
        deleteSyllabus: {
            type: SyllabusType,
            args: { ...GraphQLSchemaAuth },
            resolve(_, args) {
                return Syllabus.findByIdAndRemove(args._id);
            },
        },
        // Updating or editing
        editBook: {
            type: BookType,
            args: { ...GraphQLSchemaTemplateForBook, ...GraphQLSchemaAuth },
            resolve(_, args) {
                const tmp = { ...args };
                delete tmp._id;
                return Book.findByIdAndUpdate(args._id, { $set: tmp }, { new: true });
            },
        },
        editQuestion: {
            type: QuestionType,
            args: { ...GraphQLSchemaTemplate, ...GraphQLSchemaAuth },
            resolve(_, args) {
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
            args: { ...GraphQLSchemaTemplate, ...GraphQLSchemaAuth },
            resolve(_, args) {
                const tmp = { ...args };
                delete tmp._id;
                return Syllabus.findByIdAndUpdate(
                    args._id,
                    { $set: tmp },
                    { new: true }
                );
            },
        },
        createUser: {
            type: UserType,
            args: { ...GraphQLSchemaForUser },
            resolve(_, args) {
                return User.create(args);
            },
        },
        editProfile: {
            type: UserType,
            args: { ...GraphQLSchemaForUser, ...GraphQLSchemaAuth },
            async resolve(_, args) {
                const decodedEmail = await verifyToken(args?.token);
                if (!decodedEmail) {
                    throw new Error("Unauthenticated!");
                }
                return User.findOneAndUpdate({ email: decodedEmail },
                    { $set: { photoURL: args?.photoURL } },
                    { new: true }
                )
            }
        },
        makeAdmin: {
            type: UserType,
            args: { ...GraphQLSchemaAuth },
            async resolve(_, args) {
                const decodedEmail = await verifyToken(args?.token);
                if (!decodedEmail) {
                    throw new Error("Unauthenticated!");
                }
                const checkUser = await User.findOne({ email: decodedEmail });
                if (checkUser?.email) {
                    const editUser = await User.findById(args._id);
                    if (
                        checkUser?.role === "admin" &&
                        editUser?.email === checkUser?.email
                    ) {
                        throw new Error("Admin can not remove themselves!");
                    } else if (editUser?.role === "admin") {
                        return User.findByIdAndUpdate(
                            args._id,
                            { $set: { role: "regular" } },
                            { new: true }
                        );
                    } else {
                        return User.findByIdAndUpdate(
                            args._id,
                            { $set: { role: "admin" } },
                            { new: true }
                        );
                    }
                }
                throw new Error("Unauthenticated!");
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});

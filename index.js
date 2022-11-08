const express = require('express')
const { connectDB } = require('./Config/db')
require('dotenv').config()
const port = process.env.PORT || 5000
const { graphqlHTTP } = require('express-graphql')
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} = require('graphql')
const schema = require('./Schema/schema')
const { verifyToken } = require('./MiddleWare/isAuth')
const admin = require('firebase-admin')
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const app = express()

app.use(verifyToken)
connectDB()


app.use('/', graphqlHTTP({
  schema,
  graphiql: process.env.NODE_EVN === 'development'
}))

app.listen(port, () => console.log(`Server running on ${port}`));
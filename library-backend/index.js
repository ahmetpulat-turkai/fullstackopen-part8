require('dotenv').config()
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const User = require('./models/user')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

const server = new ApolloServer({ typeDefs, resolvers })

startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) || 4000 },
  context: async ({ req }) => {
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
        return { currentUser: await User.findById(decoded.id) }
      } catch {
        return {}
      }
    }
    return {}
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

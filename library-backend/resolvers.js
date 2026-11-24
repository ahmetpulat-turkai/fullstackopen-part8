const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const requireUser = (context) => {
  if (!context.currentUser) {
    throw new GraphQLError('not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
}

const badInput = (message, error) =>
  new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT', error: error && error.message },
  })

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}
      if (args.genre) filter.genres = args.genre
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) return []
        filter.author = author._id
      }
      return Book.find(filter).populate('author')
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser || null,
  },
  Author: {
    // n+1 problem: one aggregation per query, cached in the request context
    bookCount: async (root, args, context) => {
      if (!context.bookCounts) {
        context.bookCounts = Book.aggregate([
          { $group: { _id: '$author', count: { $sum: 1 } } },
        ]).then((rows) => new Map(rows.map((r) => [String(r._id), r.count])))
      }
      return (await context.bookCounts).get(String(root._id)) || 0
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      requireUser(context)
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
        } catch (error) {
          throw badInput('Saving author failed', error)
        }
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id,
      })
      try {
        await book.save()
      } catch (error) {
        throw badInput('Saving book failed', error)
      }
      context.bookCounts = undefined
      return book.populate('author')
    },
    editAuthor: async (root, args, context) => {
      requireUser(context)
      const author = await Author.findOne({ name: args.name })
      if (!author) return null
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw badInput('Saving birth year failed', error)
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })
      try {
        return await user.save()
      } catch (error) {
        throw badInput('Creating the user failed', error)
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw badInput('wrong credentials')
      }
      return {
        value: jwt.sign(
          { username: user.username, id: user._id },
          process.env.JWT_SECRET,
        ),
      }
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== 'test') {
        throw new GraphQLError('_resetDatabase is only available in test mode')
      }
      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})
      return true
    },
  },
}

module.exports = resolvers

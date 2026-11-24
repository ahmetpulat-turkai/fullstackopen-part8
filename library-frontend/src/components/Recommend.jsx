import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'
import BookTable from './BookTable'

const Recommend = ({ show }) => {
  const me = useQuery(ME)
  const genre = me.data?.me?.favoriteGenre
  const books = useQuery(ALL_BOOKS, { variables: { genre }, skip: !genre })

  if (!show) {
    return null
  }
  if (!genre || !books.data) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{genre}</b>
      </p>
      <BookTable books={books.data.allBooks} />
    </div>
  )
}

export default Recommend

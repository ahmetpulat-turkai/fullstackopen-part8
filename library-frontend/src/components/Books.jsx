import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'
import BookTable from './BookTable'

const Books = ({ show }) => {
  const [genre, setGenre] = useState(null)
  const all = useQuery(ALL_BOOKS)
  const filtered = useQuery(ALL_BOOKS, { variables: { genre }, skip: !genre })

  if (!show) {
    return null
  }
  if (all.loading || !all.data) {
    return <div>loading...</div>
  }

  const genres = [...new Set(all.data.allBooks.flatMap((b) => b.genres))]
  const books = genre ? filtered.data?.allBooks ?? [] : all.data.allBooks

  return (
    <div>
      <h2>books</h2>
      {genre && (
        <div>
          in genre <b>{genre}</b>
        </div>
      )}
      <BookTable books={books} />
      <div>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books

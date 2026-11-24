import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const BirthYearForm = ({ authors, notify }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    onError: (error) => notify(error.message),
  })

  const selected = name || (authors.length > 0 ? authors[0].name : '')

  const submit = async (event) => {
    event.preventDefault()
    await editAuthor({ variables: { name: selected, setBornTo: Number(born) } })
    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <label>
            name{' '}
            <select name="name" value={selected} onChange={({ target }) => setName(target.value)}>
              {authors.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            born{' '}
            <input type="number" value={born} onChange={({ target }) => setBorn(target.value)} />
          </label>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

const Authors = ({ show, loggedIn, notify }) => {
  const result = useQuery(ALL_AUTHORS)

  if (!show) {
    return null
  }
  if (result.loading || !result.data) {
    return <div>loading...</div>
  }
  const authors = result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loggedIn && <BirthYearForm authors={authors} notify={notify} />}
    </div>
  )
}

export default Authors

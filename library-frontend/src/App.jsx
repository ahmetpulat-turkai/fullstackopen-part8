import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(localStorage.getItem('library-user-token'))
  const [message, setMessage] = useState(null)
  const client = useApolloClient()

  const notify = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(null), 5000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  const onLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('library-user-token', newToken)
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      {message && <div style={{ color: 'red' }}>{message}</div>}

      <Authors show={page === 'authors'} loggedIn={!!token} notify={notify} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} notify={notify} />
      <Recommend show={page === 'recommend'} />
      <LoginForm show={page === 'login'} onLogin={onLogin} notify={notify} />
    </div>
  )
}

export default App

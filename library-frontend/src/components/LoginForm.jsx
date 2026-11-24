import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const LoginForm = ({ show, onLogin, notify }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login] = useMutation(LOGIN, {
    onError: (error) => notify(`login failed: ${error.message}`),
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    const result = await login({ variables: { username, password } })
    if (result && result.data) {
      onLogin(result.data.login.value)
      setUsername('')
      setPassword('')
    }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>
          username <input value={username} onChange={({ target }) => setUsername(target.value)} />
        </label>
      </div>
      <div>
        <label>
          password{' '}
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )
}

export default LoginForm

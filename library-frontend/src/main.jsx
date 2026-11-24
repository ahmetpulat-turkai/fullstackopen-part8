import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { ApolloProvider } from '@apollo/client/react'
import App from './App.jsx'

const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem('library-user-token')
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } }
})

const client = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri: 'http://localhost:4000' })),
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)

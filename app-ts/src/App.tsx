import React, { createContext, useState } from 'react'
import Hero from './components/Hero/Hero'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage/LandingPage'
import { WalletApi } from '@concordium/browser-wallet-api-helpers'

interface context {
  user: string | undefined
  client: WalletApi | undefined
}

export const UserContext = createContext<context>({
  user: undefined,
  client: undefined,
})

const App = () => {
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 700,
      easing: 'ease-in',
      delay: 100,
    })
    AOS.refresh()
  }, [])

  const [user, setUser] = useState<string | undefined>()
  const [client, setClient] = useState<WalletApi>()

  return (
    <UserContext.Provider value={{ user: user, client: client }}>
      <div className="bg-white dark:bg-gray-900 dark:text-white duration-200 overflow-x-hidden">
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <Hero user={user} setUser={setUser} setClient={setClient} />
              }
            />
            <Route path="/dashboard" element={<LandingPage />} />
          </Routes>
        </Router>
      </div>
    </UserContext.Provider>
  )
}

export default App

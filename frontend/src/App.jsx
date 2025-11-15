import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Certificates from './pages/Certificates'
import Contact from './pages/Contact'
import UserLayout from './components/Layout/UserLayout'
import Work from './pages/Work'
import Gears from './pages/Gears'
import CursorSetup from './pages/CursorSetup'
import Blog from './pages/Blog'
import AdminPage from './admin/AdminPage'
import SpotifyCallback from './pages/SpotifyCallback'
import WakaTimeCallback from './pages/WakaTimeCallback'
import Preloader from './components/Common/Preloader'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ReactLenis } from 'lenis/react'
import { Toaster } from 'sonner'


function App() {
  const [isLoading, setIsLoading] = useState(true)

  const handlePreloaderComplete = () => {
    setIsLoading(false)
  }

  return (
    <ThemeProvider>
      <PortfolioProvider>
        {isLoading ? (
          <Preloader onComplete={handlePreloaderComplete} />
        ) : (
          <BrowserRouter>
            <ReactLenis root />
            <Routes>
              <Route path="/" element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path="projects" element={<Projects />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="contact" element={<Contact />} />
                <Route path="work" element={<Work />} />
                <Route path="gears" element={<Gears />} />
                <Route path="setup" element={<CursorSetup />} />
                <Route path="blog" element={<Blog />} />
              </Route>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/callback" element={<SpotifyCallback />} />
              <Route path="/wakatime/callback" element={<WakaTimeCallback />} />
              </Routes>
              <Toaster richColors position="top-center" />
          </BrowserRouter>
        )}
      </PortfolioProvider>
    </ThemeProvider>
  )
}

export default App

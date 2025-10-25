import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Certificates from './pages/Certificates'
import UserLayout from './components/Layout/UserLayout'
import Work from './pages/Work'
import Gears from './pages/Gears'
import VSCodeSetup from './pages/VSCodeSetup'
import AdminPage from './admin/AdminPage'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ReactLenis, useLenis } from 'lenis/react'

function App() {
  const lenis = useLenis((lenis) => {
    // called every scroll
    // console.log(lenis) // Removed to reduce console spam
  })
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <ReactLenis root />
          <Routes>
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="work" element={<Work />} />
              <Route path="gears" element={<Gears />} />
              <Route path="setup" element={<VSCodeSetup />} />
            </Route>
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </PortfolioProvider>
    </ThemeProvider>
  )
}

export default App

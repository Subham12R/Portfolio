import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import {  useEffect, useRef } from 'react'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'sonner'

// Import page components directly
import Home from './pages/Home'
import Projects from './pages/Projects'
import Certificates from './pages/Certificates'
import Contact from './pages/Contact'
import Work from './pages/Work'
import Gears from './pages/Gears'
import CursorSetup from './pages/CursorSetup'
import Blog from './pages/Blog'
import Resume from './components/Products/Resume.jsx'
import AdminPage from './admin/AdminPage'
import UnifiedCallback from './pages/UnifiedCallback'
import WakaTimeCallback from './pages/WakaTimeCallback'
import UserLayout from './components/Layout/UserLayout'
import Components from './pages/Components'


// Routes wrapper
function AnimatedRoutes() {
  const location = useLocation()
  const prevLocationRef = useRef(location.pathname)

  // Scroll to top on route change
  useEffect(() => {
    // Only scroll if route actually changed
    if (prevLocationRef.current !== location.pathname) {
      // Scroll to top instantly
      window.scrollTo({ top: 0, behavior: 'instant' })
      prevLocationRef.current = location.pathname
    }
  }, [location.pathname])

  return (
    <div style={{ width: '100%', height: '100%' }}>
       
    
  
      <Routes location={location}>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="contact" element={<Contact />} />
          <Route path="work" element={<Work />} />
          <Route path="gears" element={<Gears />} />
          <Route path="setup" element={<CursorSetup />} />
          <Route path="blog" element={<Blog />} />
          
          <Route path="components" element={<Components />} />
        </Route>

        <Route path="/resume" element={<Resume />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/callback" element={<UnifiedCallback />} />
        <Route path="/wakatime/callback" element={<WakaTimeCallback />} />
      </Routes>
    </div>
  )
}

// Inner component that can access portfolio context
function AppContent() {
  return (
    <>
      <BrowserRouter>
        
        <AnimatedRoutes />
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </ThemeProvider>
  )
}

export default App

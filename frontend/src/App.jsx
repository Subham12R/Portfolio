import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useState, lazy, Suspense, useEffect, useRef } from 'react'
import Preloader from './components/Common/Preloader'
import { PortfolioProvider, usePortfolio } from './contexts/PortfolioContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ReactLenis } from 'lenis/react'
import { Toaster } from 'sonner'

// Lazy load page components for better performance
const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
const Certificates = lazy(() => import('./pages/Certificates'))
const Contact = lazy(() => import('./pages/Contact'))
const Work = lazy(() => import('./pages/Work'))
const Gears = lazy(() => import('./pages/Gears'))
const CursorSetup = lazy(() => import('./pages/CursorSetup'))
const Blog = lazy(() => import('./pages/Blog'))
const AdminPage = lazy(() => import('./admin/AdminPage'))
const UnifiedCallback = lazy(() => import('./pages/UnifiedCallback'))
const WakaTimeCallback = lazy(() => import('./pages/WakaTimeCallback'))
const UserLayout = lazy(() => import('./components/Layout/UserLayout'))


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
      <Suspense fallback={null}>
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
          </Route>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/callback" element={<UnifiedCallback />} />
          <Route path="/wakatime/callback" element={<WakaTimeCallback />} />
        </Routes>
      </Suspense>
    </div>
  )
}

// Inner component that can access portfolio context
function AppContent() {
  const [preloaderComplete, setPreloaderComplete] = useState(false)
  const { isLoading: isDataLoading } = usePortfolio()

  const handlePreloaderComplete = () => {
    setPreloaderComplete(true)
  }

  // Show preloader until animation completes (full 3 seconds)
  // AND until data is loaded
  const showPreloader = !preloaderComplete || isDataLoading
  
  if (showPreloader) {
    return <Preloader onComplete={handlePreloaderComplete} showMessage={isDataLoading} />
  }

  return (
    <BrowserRouter>
      <ReactLenis root />
      <AnimatedRoutes />
      <Toaster richColors position="top-center" />
    </BrowserRouter>
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

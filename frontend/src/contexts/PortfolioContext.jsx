import React, { createContext, useContext, useState, useEffect } from 'react'
import apiService from '../services/api'

const PortfolioContext = createContext()

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}

// Default data structure
const defaultData = {
  projects: [
    {
      id: 1,
      name: 'E-Commerce Platform',
      category: 'Full Stack',
      date: 'January 2025',
      image: 'https://picsum.photos/800/400',
      description: 'A comprehensive e-commerce platform with user authentication, product management, shopping cart, and payment integration. Built with modern tech stack for scalability and performance.',
      github: 'https://github.com/username/project1',
      liveUrl: 'https://project1-demo.vercel.app',
      status: 'Completed',
      tech: [
        { name: 'Next.js', icon: 'nextjs' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'Tailwind CSS', icon: 'tailwind' },
        { name: 'PostgreSQL', icon: 'postgresql' },
        { name: 'Vercel', icon: 'vercel' },
      ],
      features: [
        'User authentication and authorization',
        'Product catalog with search and filters',
        'Shopping cart and checkout process',
        'Payment integration with Stripe',
        'Admin dashboard for product management',
        'Order tracking and history'
      ]
    },
    {
      id: 2,
      name: 'Real-time Chat Application',
      category: 'Full Stack',
      date: 'December 2024',
      image: 'https://picsum.photos/801/401',
      description: 'A real-time messaging application with group chat, file sharing, and user presence indicators. Features include message reactions, typing indicators, and message search.',
      github: 'https://github.com/username/project2',
      liveUrl: 'https://project2-demo.vercel.app',
      status: 'Working',
      tech: [
        { name: 'React', icon: 'react' },
        { name: 'Node.js', icon: 'nodejs' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'PostgreSQL', icon: 'postgresql' },
      ],
      features: [
        'Real-time messaging with WebSocket',
        'Group chat functionality',
        'File and image sharing',
        'Online/offline status indicators',
        'Message reactions and emoji support',
        'Dark mode support'
      ]
    }
  ],
  workExperience: [
    {
      id: 1,
      company: 'Adamas University',
      logo: 'https://picsum.photos/200',
      role: 'Founding Frontend Engineer',
      status: 'Working',
      featured: true,
      start: 'August 2025',
      end: 'Present',
      location: 'United States (Remote)',
      tech: [
        { name: 'Next.js', icon: 'nextjs' },
        { name: 'Tailwind CSS', icon: 'tailwind' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'React', icon: 'react' },
        { name: 'Figma', icon: 'figma' },
        { name: 'Vercel', icon: 'vercel' },
        { name: 'AWS', icon: 'aws' },
        { name: 'Postman', icon: 'postman' },
        { name: 'Bun', icon: 'bun' },
      ],
      bullets: [
        'Architected and developed the complete frontend infrastructure for the platform, a comprehensive solution for creating and managing promotional campaigns.',
        'Led a comprehensive codebase refactoring initiative that improved maintainability, scalability, and development velocity across the entire platform.',
        'Integrated and optimized backend API connections, implementing efficient data fetching strategies and error handling mechanisms.',
        'Enhanced user experience and interface design through implementation of consistent design systems, accessibility standards, and performance optimizations.'
      ]
    },
    {
      id: 2,
      company: 'Upsurge Labs',
      logo: 'https://picsum.photos/201',
      role: 'Backend Developer Intern',
      status: 'Completed',
      featured: true,
      start: 'June 2025',
      end: 'July 2025',
      location: 'Bangalore, India (On-Site)',
      tech: [
        { name: 'React', icon: 'react' },
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'PostgreSQL', icon: 'postgresql' },
        { name: 'Node.js', icon: 'nodejs' },
      ],
      bullets: [
        'Developed and maintained backend services for a fintech platform.',
        'Optimized database queries and improved API response times by 40%.',
        'Collaborated with cross-functional teams to deliver new features.'
      ]
    }
  ],
  certificates: [
    {
      id: 1,
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: 'January 2025',
      credentialId: 'AWS-CSA-123456',
      credentialUrl: 'https://example.com/verify/123456',
      image: 'https://images.credly.com/images/0e284c3f-5164-4b21-8660-0d847de41ad6/image.png',
      description: 'Earned by demonstrating expertise in designing distributed systems on AWS.',
      skills: ['Cloud Architecture', 'AWS Services', 'System Design', 'Infrastructure']
    },
    {
      id: 2,
      name: 'Meta Front-End Developer',
      issuer: 'Meta (Coursera)',
      issueDate: 'December 2024',
      credentialId: 'META-FED-789012',
      credentialUrl: 'https://example.com/verify/789012',
      image: 'https://picsum.photos/400/300',
      description: 'Comprehensive front-end development covering React, JavaScript, and modern web development practices.',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Web Development']
    }
  ],
  gears: {
    devices: [
      {
        id: 1,
        name: 'Asus VivoBook S16 OLED',
        specs: 'Intel Core Ultra 7 32GB 1TB',
        type: 'laptop'
      },
      {
        id: 2,
        name: 'Custom Built',
        specs: 'CPU-Ryzen 7 7800x3D, GPU-RTX 4070S, RAM-32GB',
        type: 'desktop'
      },
      {
        id: 3,
        name: 'Samsung Odyssey G4',
        specs: '24 inch',
        type: 'monitor'
      }
    ],
    extensions: [
      {
        id: 1,
        name: 'Unhook',
        link: 'https://chrome.google.com/webstore'
      },
      {
        id: 2,
        name: 'uBlock Origin',
        link: 'https://chrome.google.com/webstore'
      },
      {
        id: 3,
        name: 'React Developer Tools',
        link: 'https://chrome.google.com/webstore'
      }
    ]
  },
  aboutMe: {
    name: 'Your Name',
    title: 'Full Stack Developer',
    bio: 'Passionate developer with expertise in modern web technologies. I love building scalable applications and solving complex problems.',
    email: 'your.email@example.com',
    location: 'Your Location',
    socialLinks: {
      github: 'https://github.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      twitter: 'https://twitter.com/yourusername'
    }
  },
  blogs: []
}

export const PortfolioProvider = ({ children }) => {
  const [data, setData] = useState(defaultData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load data from API on mount
  useEffect(() => {
    loadData()
    checkAuthentication()
  }, [])

  // Check if user is authenticated
  const checkAuthentication = async () => {
    try {
      // Initialize token from localStorage
      const token = localStorage.getItem('auth-token')
      if (token) {
        apiService.setToken(token)
      } else {
        // No token, definitely not authenticated
        setIsAuthenticated(false)
        return
      }
      
      const response = await apiService.verifyToken()
      if (response.valid && response.authenticated) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Clear invalid token
        apiService.setToken(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      // Clear invalid token
      apiService.setToken(null)
      // Don't log errors for missing tokens - this is expected
      if (error.message && !error.message.includes('Access token required')) {
        console.error('Authentication check error:', error)
      }
    }
  }

  // Load all data from API
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [projects, workExperience, certificates, gears, aboutMe, blogsResponse] = await Promise.all([
        apiService.getProjects(),
        apiService.getWorkExperience(),
        apiService.getCertificates(),
        apiService.getGears(),
        apiService.getAboutMe(),
        apiService.getBlogs().catch(() => ({ blogs: [] })) // Don't fail if blogs endpoint doesn't exist yet
      ])

      setData({
        projects: projects || [],
        workExperience: workExperience || [],
        certificates: certificates || [],
        gears: gears || { devices: [], extensions: [] },
        aboutMe: aboutMe || defaultData.aboutMe,
        blogs: blogsResponse?.blogs || []
      })
    } catch (error) {
      console.error('Error loading portfolio data:', error)
      
      // Check if it's a network error (backend not running)
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('Backend server is not running. Please start the backend server and refresh the page.')
      } else {
        setError('Failed to load portfolio data: ' + error.message)
      }
      
      // Fallback to default data
      setData(defaultData)
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = (newData) => {
    setData(newData)
  }

  const updateProjects = (projects) => {
    setData(prev => ({ ...prev, projects }))
  }

  const updateWorkExperienceArray = (workExperience) => {
    setData(prev => ({ ...prev, workExperience }))
  }

  const updateCertificates = (certificates) => {
    setData(prev => ({ ...prev, certificates }))
  }

  const updateGears = (gears) => {
    setData(prev => ({ ...prev, gears }))
  }

  const updateAboutMe = async (aboutMe) => {
    try {
      const updatedAboutMe = await apiService.updateAboutMe(aboutMe)
      setData(prev => ({ ...prev, aboutMe: updatedAboutMe }))
      return updatedAboutMe
    } catch (error) {
      console.error('Error updating about me:', error)
      setError('Failed to update about me')
      throw error
    }
  }

  const addProject = async (project) => {
    try {
      const newProject = await apiService.createProject(project)
      setData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject]
      }))
      return newProject
    } catch (error) {
      console.error('Error creating project:', error)
      setError('Failed to create project')
      throw error
    }
  }

  const updateProject = async (id, updatedProject) => {
    try {
      const project = await apiService.updateProject(id, updatedProject)
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === id ? project : p
        )
      }))
      return project
    } catch (error) {
      console.error('Error updating project:', error)
      setError('Failed to update project')
      throw error
    }
  }

  const deleteProject = async (id) => {
    try {
      await apiService.deleteProject(id)
      setData(prev => ({
        ...prev,
        projects: prev.projects.filter(project => project.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting project:', error)
      setError('Failed to delete project')
      throw error
    }
  }

  const addWorkExperience = async (experience) => {
    try {
      const newExperience = await apiService.createWorkExperience(experience)
      setData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, newExperience]
      }))
      return newExperience
    } catch (error) {
      console.error('Error creating work experience:', error)
      setError('Failed to create work experience')
      throw error
    }
  }

  const updateWorkExperience = async (id, updatedExperience) => {
    try {
      const experience = await apiService.updateWorkExperience(id, updatedExperience)
      setData(prev => ({
        ...prev,
        workExperience: prev.workExperience.map(exp => 
          exp.id === id ? experience : exp
        )
      }))
      return experience
    } catch (error) {
      console.error('Error updating work experience:', error)
      setError('Failed to update work experience')
      throw error
    }
  }

  const deleteWorkExperience = async (id) => {
    try {
      await apiService.deleteWorkExperience(id)
      setData(prev => ({
        ...prev,
        workExperience: prev.workExperience.filter(exp => exp.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting work experience:', error)
      setError('Failed to delete work experience')
      throw error
    }
  }

  const addCertificate = async (certificate) => {
    try {
      const newCertificate = await apiService.createCertificate(certificate)
      setData(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCertificate]
      }))
      return newCertificate
    } catch (error) {
      console.error('Error creating certificate:', error)
      setError('Failed to create certificate')
      throw error
    }
  }

  const updateCertificate = async (id, updatedCertificate) => {
    try {
      const certificate = await apiService.updateCertificate(id, updatedCertificate)
      setData(prev => ({
        ...prev,
        certificates: prev.certificates.map(cert => 
          cert.id === id ? certificate : cert
        )
      }))
      return certificate
    } catch (error) {
      console.error('Error updating certificate:', error)
      setError('Failed to update certificate')
      throw error
    }
  }

  const deleteCertificate = async (id) => {
    try {
      await apiService.deleteCertificate(id)
      setData(prev => ({
        ...prev,
        certificates: prev.certificates.filter(cert => cert.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting certificate:', error)
      setError('Failed to delete certificate')
      throw error
    }
  }

  const addGear = async (gear, type) => {
    try {
      const newGear = await apiService.createGear(gear)
      setData(prev => ({
        ...prev,
        gears: {
          ...prev.gears,
          [type]: [...prev.gears[type], newGear]
        }
      }))
      return newGear
    } catch (error) {
      console.error('Error creating gear:', error)
      setError('Failed to create gear')
      throw error
    }
  }

  const updateGear = async (id, updatedGear, type) => {
    try {
      const gear = await apiService.updateGear(id, updatedGear)
      setData(prev => ({
        ...prev,
        gears: {
          ...prev.gears,
          [type]: prev.gears[type].map(g => 
            g.id === id ? gear : g
          )
        }
      }))
      return gear
    } catch (error) {
      console.error('Error updating gear:', error)
      setError('Failed to update gear')
      throw error
    }
  }

  const deleteGear = async (id, type) => {
    try {
      await apiService.deleteGear(id)
      setData(prev => ({
        ...prev,
        gears: {
          ...prev.gears,
          [type]: prev.gears[type].filter(gear => gear.id !== id)
        }
      }))
    } catch (error) {
      console.error('Error deleting gear:', error)
      setError('Failed to delete gear')
      throw error
    }
  }

  const addBlog = async (blog) => {
    try {
      const response = await apiService.createBlog(blog)
      const newBlog = response.blog || response
      setData(prev => ({
        ...prev,
        blogs: [...prev.blogs, newBlog]
      }))
      return newBlog
    } catch (error) {
      console.error('Error creating blog:', error)
      setError('Failed to create blog')
      throw error
    }
  }

  const updateBlog = async (id, updatedBlog) => {
    try {
      const response = await apiService.updateBlog(id, updatedBlog)
      const blog = response.blog || response
      setData(prev => ({
        ...prev,
        blogs: prev.blogs.map(b => 
          b.id === id ? blog : b
        )
      }))
      return blog
    } catch (error) {
      console.error('Error updating blog:', error)
      setError('Failed to update blog')
      throw error
    }
  }

  const deleteBlog = async (id) => {
    try {
      await apiService.deleteBlog(id)
      setData(prev => ({
        ...prev,
        blogs: prev.blogs.filter(blog => blog.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting blog:', error)
      setError('Failed to delete blog')
      throw error
    }
  }

  const resetData = () => {
    setData(defaultData)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'portfolio-data.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)
          setData(importedData)
          resolve(importedData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  // Authentication methods
  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password)
      // Set the token in the API service
      apiService.setToken(response.token)
      setIsAuthenticated(true)
      await loadData() // Reload data after login
      return response
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed')
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
      // Clear the token from the API service
      apiService.setToken(null)
      setIsAuthenticated(false)
      setData(defaultData) // Reset to default data
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const register = async (email, password, name) => {
    try {
      const response = await apiService.register(email, password, name)
      setIsAuthenticated(true)
      await loadData() // Reload data after registration
      return response
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed')
      throw error
    }
  }

  const value = {
    data,
    isLoading,
    error,
    isAuthenticated,
    updateData,
    updateProjects,
    updateWorkExperienceArray,
    updateCertificates,
    updateGears,
    updateAboutMe,
    addProject,
    updateProject,
    deleteProject,
    addWorkExperience,
    updateWorkExperience,
    deleteWorkExperience,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addGear,
    updateGear,
    deleteGear,
    addBlog,
    updateBlog,
    deleteBlog,
    resetData,
    exportData,
    importData,
    login,
    logout,
    register,
    loadData,
    clearError: () => setError(null)
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioContext

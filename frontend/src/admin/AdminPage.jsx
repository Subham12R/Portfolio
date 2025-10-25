import React, { useState, useEffect } from 'react'
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaEye,
  FaCode,
  FaBriefcase,
  FaCertificate,
  FaDesktop,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaDownload,
  FaUpload,
  FaUndo
} from 'react-icons/fa'
import { HiChevronDown, HiChevronUp } from 'react-icons/hi'
import { usePortfolio } from '../contexts/PortfolioContext'
import AdminAuth from '../components/Admin/AdminAuth'
import ImageUpload from '../components/Common/ImageUpload'


const AdminPage = () => {
  const { 
    data, 
    isLoading,
    error,
    isAuthenticated,
    updateData, 
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
    updateAboutMe,
    resetData,
    exportData,
    importData,
    logout,
    loadData,
    clearError
  } = usePortfolio()
  
  const [activeTab, setActiveTab] = useState('projects')
  const [editingItem, setEditingItem] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FaCode },
    { id: 'work', label: 'Work Experience', icon: FaBriefcase },
    { id: 'certificates', label: 'Certificates', icon: FaCertificate },
    { id: 'gears', label: 'Gears & Tools', icon: FaDesktop },
    { id: 'about', label: 'About Me', icon: FaUser }
  ]

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingItem(getEmptyItem(activeTab))
  }

  const handleEdit = (item) => {
    setEditingItem({ ...item })
    setIsAdding(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (activeTab === 'gears') {
        const gearType = Object.keys(data.gears).find(key => 
          data.gears[key].some(item => item.id === id)
        )
        deleteGear(id, gearType)
      } else if (activeTab === 'projects') {
        deleteProject(id)
      } else if (activeTab === 'work') {
        deleteWorkExperience(id)
      } else if (activeTab === 'certificates') {
        deleteCertificate(id)
      }
    }
  }

  const handleSave = () => {
    console.log('Saving item:', editingItem)
    console.log('Active tab:', activeTab)
    
    if (activeTab === 'about') {
      updateAboutMe(editingItem)
    } else if (activeTab === 'gears') {
      const gearType = Object.keys(data.gears).find(key => 
        data.gears[key].some(item => item.id === editingItem.id)
      ) || 'devices'
      
      if (isAdding) {
        addGear(editingItem, gearType)
      } else {
        updateGear(editingItem.id, editingItem, gearType)
      }
    } else if (activeTab === 'projects') {
      if (isAdding) {
        addProject(editingItem)
      } else {
        updateProject(editingItem.id, editingItem)
      }
    } else if (activeTab === 'work') {
      if (isAdding) {
        addWorkExperience(editingItem)
      } else {
        updateWorkExperience(editingItem.id, editingItem)
      }
    } else if (activeTab === 'certificates') {
      if (isAdding) {
        addCertificate(editingItem)
      } else {
        updateCertificate(editingItem.id, editingItem)
      }
    }
    
    setEditingItem(null)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsAdding(false)
  }

  const getEmptyItem = (type) => {
    const emptyItems = {
      projects: {
        name: '',
        category: '',
        date: '',
        image: '',
        description: '',
        github: '',
        liveUrl: '',
        tech: [],
        features: [],
        status: 'Completed'
      },
      workExperience: {
        company: '',
        logo: '',
        role: '',
        status: 'Working',
        featured: true,
        start: '',
        end: '',
        location: '',
        tech: [],
        bullets: []
      },
      certificates: {
        name: '',
        issuer: '',
        issueDate: '',
        credentialId: '',
        credentialUrl: '',
        image: '',
        description: '',
        skills: []
      },
      gears: {
        name: '',
        specs: '',
        type: 'laptop'
      },
      about: {
        name: '',
        title: '',
        bio: '',
        email: '',
        location: '',
        socialLinks: {
          github: '',
          linkedin: '',
          twitter: ''
        }
      }
    }
    return emptyItems[type] || {}
  }

  const renderProjects = () => (
    <div className="space-y-4">
      {data.projects.map((project) => {
        console.log('Admin project status:', project.status, 'for project:', project.name)
        return (
          <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'Working' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{project.category} • {project.date}</p>
                <p className="text-gray-500 text-sm mt-1">{project.description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(project)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderWorkExperience = () => (
    <div className="space-y-4">
      {data.workExperience.map((exp) => (
        <div key={exp.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{exp.company}</h3>
              <p className="text-gray-600 text-sm">{exp.role}</p>
              <p className="text-gray-500 text-sm">{exp.start} - {exp.end}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(exp)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderCertificates = () => (
    <div className="space-y-4">
      {data.certificates.map((cert) => (
        <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{cert.name}</h3>
              <p className="text-gray-600 text-sm">{cert.issuer}</p>
              <p className="text-gray-500 text-sm">{cert.issueDate}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(cert)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(cert.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderGears = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Devices</h3>
          <button
            onClick={() => {
              setEditingItem({ ...getEmptyItem('gears'), type: 'laptop' })
              setIsAdding(true)
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Add Device
          </button>
        </div>
        <div className="space-y-2">
          {data.gears.devices.map((device) => (
            <div key={device.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{device.name}</h4>
                  <p className="text-gray-600 text-sm">{device.specs}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(device)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Extensions</h3>
          <button
            onClick={() => {
              setEditingItem({ ...getEmptyItem('gears'), type: 'extension' })
              setIsAdding(true)
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FaPlus /> Add Extension
          </button>
        </div>
        <div className="space-y-2">
          {data.gears.extensions.map((extension) => (
            <div key={extension.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{extension.name}</h4>
                  <p className="text-gray-600 text-sm">{extension.link}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(extension)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(extension.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAboutMe = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">About Me</h3>
        <button
          onClick={() => handleEdit(data.aboutMe)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FaEdit /> Edit
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <p className="text-gray-900">{data.aboutMe.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <p className="text-gray-900">{data.aboutMe.title}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <p className="text-gray-900">{data.aboutMe.bio}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-gray-900">{data.aboutMe.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <p className="text-gray-900">{data.aboutMe.location}</p>
        </div>
      </div>
    </div>
  )

  const renderForm = () => {
    if (!editingItem) return null

    const isGear = activeTab === 'gears'
    const isAbout = activeTab === 'about'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isAdding ? 'Add' : 'Edit'} {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            {activeTab === 'projects' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingItem.category || ''}
                      onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingItem.status || 'Completed'}
                      onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Working">Working</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="text"
                      value={editingItem.date || ''}
                      onChange={(e) => setEditingItem({...editingItem, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="January 2025"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
                <ImageUpload
                  onImageUpload={(imageUrl) => setEditingItem({...editingItem, image: imageUrl})}
                  currentImage={editingItem.image || ''}
                  label="Project Image"
                  className="mb-4"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={editingItem.github || ''}
                      onChange={(e) => setEditingItem({...editingItem, github: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                    <input
                      type="url"
                      value={editingItem.liveUrl || ''}
                      onChange={(e) => setEditingItem({...editingItem, liveUrl: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingItem.tech) ? editingItem.tech.map(t => typeof t === 'string' ? t : t.name).join(', ') : editingItem.tech || ''}
                    onChange={(e) => setEditingItem({...editingItem, tech: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                  <textarea
                    value={Array.isArray(editingItem.features) ? editingItem.features.join('\n') : editingItem.features || ''}
                    onChange={(e) => setEditingItem({...editingItem, features: e.target.value.split('\n').filter(f => f.trim())})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="4"
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  />
                </div>
              </>
            )}

            {activeTab === 'work' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={editingItem.company || ''}
                      onChange={(e) => setEditingItem({...editingItem, company: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={editingItem.role || ''}
                      onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="text"
                      value={editingItem.start || ''}
                      onChange={(e) => setEditingItem({...editingItem, start: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="August 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="text"
                      value={editingItem.end || ''}
                      onChange={(e) => setEditingItem({...editingItem, end: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Present"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editingItem.status || 'Working'}
                      onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="Working">Working</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Remote, United States"
                  />
                </div>
                <ImageUpload
                  onImageUpload={(imageUrl) => setEditingItem({...editingItem, logo: imageUrl})}
                  currentImage={editingItem.logo || ''}
                  label="Company Logo"
                  className="mb-4"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingItem.tech) ? editingItem.tech.map(t => typeof t === 'string' ? t : t.name).join(', ') : editingItem.tech || ''}
                    onChange={(e) => setEditingItem({...editingItem, tech: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accomplishments (one per line)</label>
                  <textarea
                    value={Array.isArray(editingItem.bullets) ? editingItem.bullets.join('\n') : editingItem.bullets || ''}
                    onChange={(e) => setEditingItem({...editingItem, bullets: e.target.value.split('\n').filter(b => b.trim())})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="4"
                    placeholder="Accomplishment 1&#10;Accomplishment 2&#10;Accomplishment 3"
                  />
                </div>
              </>
            )}

            {activeTab === 'certificates' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issuer</label>
                    <input
                      type="text"
                      value={editingItem.issuer || ''}
                      onChange={(e) => setEditingItem({...editingItem, issuer: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input
                      type="text"
                      value={editingItem.issueDate || ''}
                      onChange={(e) => setEditingItem({...editingItem, issueDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="January 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                    <input
                      type="text"
                      value={editingItem.credentialId || ''}
                      onChange={(e) => setEditingItem({...editingItem, credentialId: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
                  <input
                    type="url"
                    value={editingItem.credentialUrl || ''}
                    onChange={(e) => setEditingItem({...editingItem, credentialUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editingItem.image || ''}
                    onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://example.com/certificate-image.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingItem.skills) ? editingItem.skills.join(', ') : editingItem.skills || ''}
                    onChange={(e) => setEditingItem({...editingItem, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="React, JavaScript, HTML/CSS"
                  />
                </div>
              </>
            )}

            {activeTab === 'gears' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                  <input
                    type="text"
                    value={editingItem.specs || ''}
                    onChange={(e) => setEditingItem({...editingItem, specs: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Intel Core Ultra 7 32GB 1TB"
                  />
                </div>
                {editingItem.type === 'extension' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                    <input
                      type="url"
                      value={editingItem.link || ''}
                      onChange={(e) => setEditingItem({...editingItem, link: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://chrome.google.com/webstore"
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === 'about' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={editingItem.bio || ''}
                    onChange={(e) => setEditingItem({...editingItem, bio: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingItem.email || ''}
                      onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editingItem.location || ''}
                      onChange={(e) => setEditingItem({...editingItem, location: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Social Links</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                      <input
                        type="url"
                        value={editingItem.socialLinks?.github || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem, 
                          socialLinks: {...editingItem.socialLinks, github: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        value={editingItem.socialLinks?.linkedin || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem, 
                          socialLinks: {...editingItem.socialLinks, linkedin: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <input
                        type="url"
                        value={editingItem.socialLinks?.twitter || ''}
                        onChange={(e) => setEditingItem({
                          ...editingItem, 
                          socialLinks: {...editingItem.socialLinks, twitter: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaSave /> Save
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return renderProjects()
      case 'work':
        return renderWorkExperience()
      case 'certificates':
        return renderCertificates()
      case 'gears':
        return renderGears()
      case 'about':
        return renderAboutMe()
      default:
        return null
    }
  }

  const handleLogin = (success) => {
    // Login is handled by the context
  }

  const handleLogout = async () => {
    await logout()
  }

  if (!isAuthenticated) {
    return <AdminAuth onLogin={handleLogin} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
            <p className="mb-4 text-sm">{error}</p>
            
            <div className="space-y-2">
              <button 
                onClick={() => {
                  clearError()
                  loadData()
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mr-2"
              >
                Retry
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Refresh Page
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-600">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="text-left mt-2 space-y-1">
                <li>• Make sure backend server is running on port 5000</li>
                <li>• Check if Supabase is configured correctly</li>
                <li>• Verify network connection</li>
                <li>• Check browser console for more details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Admin</h1>
            <p className="text-gray-600">Manage your portfolio content</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
              <FaUpload /> Upload Resume
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    // Handle resume upload
                    const formData = new FormData();
                    formData.append('resume', e.target.files[0]);
                    
                    fetch('/api/upload/resume', {
                      method: 'POST',
                      body: formData,
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                      }
                    })
                    .then(response => response.json())
                    .then(data => {
                      if (data.success) {
                        alert('Resume uploaded successfully!');
                      } else {
                        alert('Failed to upload resume: ' + data.error);
                      }
                    })
                    .catch(error => {
                      alert('Error uploading resume: ' + error.message);
                    });
                  }
                }}
                className="hidden"
              />
            </label>
            <button 
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <FaDownload /> Export
            </button>
            <label className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer">
              <FaUpload /> Import
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    importData(e.target.files[0])
                      .then(() => alert('Data imported successfully!'))
                      .catch(() => alert('Error importing data!'))
                  }
                }}
                className="hidden"
              />
            </label>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data?')) {
                  resetData()
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-900"
            >
              <FaUndo /> Reset
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900">
              <FaEye /> Preview
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">
                Manage your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}
              </p>
            </div>
            {activeTab !== 'about' && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus /> Add {tabs.find(t => t.id === activeTab)?.label.slice(0, -1)}
              </button>
            )}
          </div>

          {renderContent()}
        </div>
      </div>

      {renderForm()}
    </div>
  )
}

export default AdminPage

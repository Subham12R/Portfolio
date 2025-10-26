import React, { useState } from 'react';
import { FaPlus, FaTimes, FaChevronDown } from 'react-icons/fa';

const TechStackSelector = ({ 
  selectedTech = [], 
  onChange, 
  label = "Technologies",
  placeholder = "Select or add technologies"
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customTech, setCustomTech] = useState('');

  // Popular tech stack options
  const popularTech = [
    // Frontend
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'TypeScript', 'JavaScript',
    'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI', 'Styled Components',
    
    // Backend
    'Node.js', 'Express.js', 'Fastify', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI',
    'Java', 'Spring Boot', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Ruby on Rails',
    'Go', 'Rust', 'Kotlin', 'Scala',
    
    // Databases
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase',
    'DynamoDB', 'Elasticsearch', 'Neo4j',
    
    // Cloud & DevOps
    'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Heroku', 'Docker', 'Kubernetes',
    'GitHub Actions', 'GitLab CI', 'Jenkins', 'Terraform',
    
    // Mobile
    'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Swift', 'Kotlin (Android)',
    
    // Tools & Others
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Figma', 'Adobe XD', 'Sketch',
    'Webpack', 'Vite', 'Parcel', 'Babel', 'ESLint', 'Prettier', 'Jest', 'Cypress',
    'GraphQL', 'REST API', 'WebSocket', 'JWT', 'OAuth', 'Stripe', 'PayPal'
  ];

  const handleTechToggle = (tech) => {
    const isSelected = selectedTech.includes(tech);
    let newTech;
    
    if (isSelected) {
      newTech = selectedTech.filter(t => t !== tech);
    } else {
      newTech = [...selectedTech, tech];
    }
    
    onChange(newTech);
  };

  const handleAddCustomTech = () => {
    if (customTech.trim() && !selectedTech.includes(customTech.trim())) {
      const newTech = [...selectedTech, customTech.trim()];
      onChange(newTech);
      setCustomTech('');
    }
  };

  const handleRemoveTech = (techToRemove) => {
    const newTech = selectedTech.filter(t => t !== techToRemove);
    onChange(newTech);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTech();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {/* Selected Technologies Display */}
      {selectedTech.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTech.map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tech}
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="text-gray-500">{placeholder}</span>
          <FaChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Content */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {/* Popular Technologies */}
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Technologies</h4>
              <div className="grid grid-cols-2 gap-2">
                {popularTech.map((tech) => (
                  <label
                    key={tech}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTech.includes(tech)}
                      onChange={() => handleTechToggle(tech)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Tech Input */}
            <div className="border-t border-gray-200 p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Technology</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter custom technology"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTech}
                  disabled={!customTech.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default TechStackSelector;

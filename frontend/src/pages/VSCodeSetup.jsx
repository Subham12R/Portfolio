import React from 'react'
import { FaDownload, FaFileAlt, FaCode, FaChevronRight } from 'react-icons/fa'

const steps = [
  {
    number: 1,
    title: 'Download necessary files',
    items: [
      {
        icon: <FaFileAlt className="text-blue-500" />,
        name: 'Fira-code.zip',
        description: 'Unzip the font\'s file.',
        downloadLink: '#'
      },
      {
        icon: <FaFileAlt className="text-green-500" />,
        name: 'vsc-extensions.txt',
        description: 'Place this file in downloads.',
        downloadLink: '#'
      }
    ],
    instructions: [
      'Select all the fonts, right click, and click to Install.',
      'Open the vscode in downloads directory',
      'Install VSC Export & Import extension in vs code'
    ]
  },
  {
    number: 2,
    title: 'Installing all the extensions',
    items: [
      {
        icon: <FaCode className="text-purple-500" />,
        name: 'Open Command Palette',
        description: 'Press the keyboard shortcut',
        shortcut: 'Cmd + ⇧ + P (Mac) / Ctrl + ⇧ + P (Windows)'
      }
    ],
    instructions: [
      'Enter the text in prompt and press Enter:',
      'VSC Export & Import'
    ]
  }
]

const VSCodeSetup = () => {
  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-black font-bold text-4xl mb-2">Setup</h1>
        <p className="text-gray-600">
          Complete guide to setup VS Code with my preferences, extensions, and fonts.
        </p>
      </div>

      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.number} className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              Step {step.number}: {step.title}
            </h2>

            {/* Files/Items */}
            <div className="space-y-3 mb-4">
              {step.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    {item.downloadLink && (
                      <a
                        href={item.downloadLink}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <FaDownload />
                        Download
                      </a>
                    )}
                  </div>
                  {item.shortcut && (
                    <div className="mt-2 pl-8">
                      <code className="bg-white px-3 py-1 rounded border border-gray-300 text-sm font-mono">
                        {item.shortcut}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            {step.instructions && (
              <div className="space-y-2 mt-4 pl-4 border-l-2 border-blue-500">
                {step.instructions.map((instruction, index) => (
                  <p key={index} className="text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">
                      <FaChevronRight className="text-xs" />
                    </span>
                    {instruction}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default VSCodeSetup

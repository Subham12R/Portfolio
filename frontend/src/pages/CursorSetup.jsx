import React from 'react'
import { FaDownload, FaFileAlt, FaCode, FaChevronRight, FaCopy } from 'react-icons/fa'
import cursorIcon from '../assets/cursor.webp'

// Common Cursor extensions list - Update this with your actual extensions
const cursorExtensions = [
  'dbaeumer.vscode-eslint',
  'esbenp.prettier-vscode',
  'bradlc.vscode-tailwindcss',
  'ms-python.python',
  'ms-vscode.vscode-typescript-next',
  'formulahendry.auto-rename-tag',
  'christian-kohler.path-intellisense',
  'ms-vscode.vscode-json',
  'pkief.material-icon-theme',
  'zhuangtongfa.material-theme',
  'github.copilot',
  'github.copilot-chat',
  'eamodio.gitlens',
  'ritwickdey.liveserver',
  'ms-vscode.vscode-json',
  'ms-playwright.playwright',
  'dbaeumer.vscode-eslint',
  'usernamehw.errorlens',
  'streetsidesoftware.code-spell-checker'
]

const steps = [
  {
    number: 1,
    title: 'Export Your Cursor Extensions',
    items: [
      {
        icon: <FaCode className="text-blue-500" />,
        name: 'Open Command Palette',
        description: 'Press the keyboard shortcut',
        shortcut: 'Cmd + ⇧ + P (Mac) / Ctrl + ⇧ + P (Windows)'
      },
      {
        icon: <FaFileAlt className="text-green-500" />,
        name: 'Export Extensions List',
        description: 'Type and run: "Extensions: Show Installed Extensions" then copy the list, or use terminal command',
        shortcut: 'code --list-extensions > extensions.txt'
      }
    ],
    instructions: [
      'Open Cursor',
      'Press Cmd/Ctrl + ⇧ + P to open Command Palette',
      'Type "Extensions: Show Installed Extensions"',
      'Copy all extension IDs, or use terminal: cursor --list-extensions > cursor-extensions.txt',
      'Save the file for sharing or backup'
    ]
  },
  {
    number: 2,
    title: 'Install Extensions in Cursor',
    items: [
      {
        icon: <FaCode className="text-purple-500" />,
        name: 'Method 1: Install from Extensions Marketplace',
        description: 'Open Extensions view and search for each extension',
        shortcut: 'Cmd/Ctrl + ⇧ + X'
      },
      {
        icon: <FaFileAlt className="text-orange-500" />,
        name: 'Method 2: Install from Command Line',
        description: 'Use terminal to install extensions in batch',
        shortcut: 'cursor --install-extension <extension-id>'
      }
    ],
    instructions: [
      'Open Extensions view (Cmd/Ctrl + ⇧ + X)',
      'Search for each extension by ID and click Install',
      'Or use terminal: for each extension, run: cursor --install-extension <extension-id>',
      'Alternative: Copy extension IDs below and install them one by one'
    ]
  },
  {
    number: 3,
    title: 'Copy My Extension List',
    items: [
      {
        icon: <FaCopy className="text-indigo-500" />,
        name: 'Extension IDs',
        description: 'Copy these extension IDs to install in your Cursor',
        extensions: cursorExtensions
      }
    ],
    instructions: [
      'Click the "Copy All" button below to copy all extension IDs',
      'Open Cursor terminal',
      'Run: cursor --install-extension <paste-extension-id> for each extension',
      'Or manually install each from Extensions marketplace'
    ]
  },
  {
    number: 4,
    title: 'Install Font (Fira Code)',
    items: [
      {
        icon: <FaFileAlt className="text-blue-500" />,
        name: 'Fira Code Font',
        description: 'Download and install Fira Code font for better code readability',
        downloadLink: 'https://github.com/tonsky/FiraCode/releases/latest'
      }
    ],
    instructions: [
      'Download Fira Code from the link above',
      'Extract the ZIP file',
      'Select all .ttf files, right-click and select "Install"',
      'Restart Cursor',
      'Go to Settings → Font Family and set: "Fira Code", "Consolas", "monospace"',
      'Enable font ligatures in Settings'
    ]
  },
  {
    number: 5,
    title: 'Configure Cursor Settings',
    items: [
      {
        icon: <FaCode className="text-green-500" />,
        name: 'Open Settings JSON',
        description: 'Open settings.json file to paste configuration',
        shortcut: 'Cmd/Ctrl + , then click "Open Settings (JSON)"'
      }
    ],
    instructions: [
      'Press Cmd/Ctrl + , to open Settings',
      'Click the "Open Settings (JSON)" icon in the top right',
      'Paste the configuration below',
      'Save the file (Cmd/Ctrl + S)',
      'Restart Cursor for changes to take effect'
    ]
  }
]

const CursorSetup = () => {
  const copyExtensions = () => {
    const extensionsText = cursorExtensions.join('\n')
    navigator.clipboard.writeText(extensionsText).then(() => {
      alert('Extension IDs copied to clipboard!')
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = extensionsText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Extension IDs copied to clipboard!')
    })
  }

  const copyInstallCommand = () => {
    const command = cursorExtensions.map(ext => `cursor --install-extension ${ext}`).join('\n')
    navigator.clipboard.writeText(command).then(() => {
      alert('Install commands copied to clipboard!')
    }).catch(() => {
      const textarea = document.createElement('textarea')
      textarea.value = command
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Install commands copied to clipboard!')
    })
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="mb-8 flex items-center gap-4">
        <img src={cursorIcon} alt="Cursor" className="w-16 h-16" />
        <div>
          <h1 className="text-black dark:text-white font-bold text-4xl mb-2">Cursor Setup</h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Complete guide to setup Cursor with my preferences, extensions, and fonts.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.number} className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              Step {step.number}: {step.title}
            </h2>

            {/* Files/Items */}
            <div className="space-y-3 mb-4">
              {step.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">{item.description}</p>
                    </div>
                    {item.downloadLink && (
                      <a
                        href={item.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <FaDownload />
                        Download
                      </a>
                    )}
                  </div>
                  {item.shortcut && (
                    <div className="mt-2 pl-8">
                      <code className="bg-white dark:bg-zinc-950 px-3 py-1 rounded border border-gray-300 dark:border-zinc-700 text-sm font-mono dark:text-zinc-300">
                        {item.shortcut}
                      </code>
                    </div>
                  )}
                  {item.extensions && (
                    <div className="mt-4 pl-8">
                      <div className="bg-white dark:bg-zinc-950 rounded border border-gray-300 dark:border-zinc-700 p-4 max-h-60 overflow-y-auto">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                            {item.extensions.length} Extensions:
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={copyExtensions}
                              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                            >
                              <FaCopy className="text-xs" />
                              Copy IDs
                            </button>
                            <button
                              onClick={copyInstallCommand}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              <FaCopy className="text-xs" />
                              Copy Commands
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {item.extensions.map((ext, idx) => (
                            <code
                              key={idx}
                              className="block text-xs font-mono text-gray-600 dark:text-zinc-400 py-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                            >
                              {ext}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            {step.instructions && (
              <div className="space-y-2 mt-4 pl-4 border-l-2 border-blue-500">
                {step.instructions.map((instruction, index) => (
                  <p key={index} className="text-gray-700 dark:text-zinc-400 flex items-start gap-2">
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

        {/* Settings JSON Section */}
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Recommended Settings
          </h2>
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Cursor Settings (settings.json)
              </p>
              <button
                onClick={() => {
                  const settings = `{
  "editor.fontFamily": "Fira Code, Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "editor.minimap.enabled": true,
  "editor.wordWrap": "on",
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "workbench.iconTheme": "material-icon-theme",
  "workbench.colorTheme": "One Dark Pro",
  "terminal.integrated.fontFamily": "Fira Code",
  "terminal.integrated.fontSize": 13,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.singleQuote": true,
  "prettier.semi": false,
  "prettier.tabWidth": 2,
  "prettier.trailingComma": "es5"
}`
                  navigator.clipboard.writeText(settings).then(() => {
                    alert('Settings copied to clipboard!')
                  })
                }}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                <FaCopy className="text-xs" />
                Copy Settings
              </button>
            </div>
            <pre className="text-xs font-mono text-gray-600 dark:text-zinc-400 overflow-x-auto">
              <code>{`{
  "editor.fontFamily": "Fira Code, Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "files.autoSave": "afterDelay",
  "editor.minimap.enabled": true,
  "workbench.iconTheme": "material-icon-theme",
  ...
}`}</code>
            </pre>
          </div>
        </div>
      </div>

    </section>
  )
}

export default CursorSetup


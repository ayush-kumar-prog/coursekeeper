'use client'

import { useState } from 'react'

interface PatchNotesResult {
  success: boolean
  patchNotes: {
    tldr: string[]
    sections: {
      major: string[]
      tools: string[]
      resources: string[]
      corrections: string[]
      emerging: string[]
    }
    deltaPath: Array<{
      title: string
      hours: number
      link: string
      type: string
    }>
    bibliography: Array<{
      key: string
      title: string
      url: string
      venue: string
      year: number
    }>
  }
  changes: unknown[]
  meta: {
    changesCount: number
    sectionsCount: number
    year: number
    baselineYear: number
  }
}

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PatchNotesResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: 'test', year: 2014 })
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          CourseKeeper Test Page
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Patch Notes Generation</h2>
          <p className="text-gray-600 mb-4">
            This tests your diff-engine and patch-writer with mock data
          </p>
          
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Generating...' : 'Generate Patch Notes (2014)'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Meta Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                ✅ Success!
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Changes:</span>{' '}
                  {result.meta?.changesCount}
                </div>
                <div>
                  <span className="font-medium">Year:</span>{' '}
                  {result.meta?.year}
                </div>
                <div>
                  <span className="font-medium">Baseline:</span>{' '}
                  {result.meta?.baselineYear}
                </div>
              </div>
            </div>

            {/* TL;DR */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                TL;DR
              </h3>
              <ul className="space-y-2">
                {result.patchNotes.tldr.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700 leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Major Changes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                🚀 Major Changes
              </h3>
              <ul className="space-y-3">
                {result.patchNotes.sections.major.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700 leading-relaxed pl-4 border-l-4 border-blue-500">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                🛠️ New Tools
              </h3>
              <ul className="space-y-2">
                {result.patchNotes.sections.tools.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700 leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Delta Path */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                📚 Delta Path (Learning Resources)
              </h3>
              <div className="space-y-3">
                {result.patchNotes.deltaPath.map((item, i: number) => (
                  <div
                    key={i}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-shrink-0 w-16 text-center">
                      <span className="text-sm font-medium text-gray-600">
                        {item.hours}h
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.type}
                      </div>
                    </div>
                    <div className="flex-1">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {item.title}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Data */}
            <details className="bg-gray-100 rounded-lg p-6">
              <summary className="cursor-pointer font-semibold text-gray-900">
                🔍 View Raw JSON
              </summary>
              <pre className="mt-4 text-xs overflow-auto bg-gray-900 text-green-400 p-4 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}


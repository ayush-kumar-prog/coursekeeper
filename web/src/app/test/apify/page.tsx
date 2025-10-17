'use client'

import { useState } from 'react'

export default function ApifyTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testApify = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await fetch('/api/test/apify')
      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          🔬 Apify Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Apify Integration</h2>
          <p className="text-gray-600 mb-4">
            This will verify:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>✓ APIFY_API_TOKEN is valid</li>
            <li>✓ Apify account access works</li>
            <li>✓ arXiv MCP server is accessible</li>
            <li>✓ Can fetch sample data from arXiv</li>
          </ul>
          
          <button
            onClick={testApify}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Testing...' : 'Test Apify Connection'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && result.success && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 font-semibold mb-2">
                ✅ Apify Connection Successful!
              </h3>
              <p className="text-green-700">All tests passed</p>
            </div>

            {/* Apify Account Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                🔐 Apify Account
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Username:</span>
                  <span className="text-gray-700">{result.data.apify.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-700">{result.data.apify.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Token Status:</span>
                  <span className="text-green-600 font-semibold">✓ Valid</span>
                </div>
              </div>
            </div>

            {/* arXiv MCP Server Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                📚 arXiv MCP Server
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">URL:</span>
                  <span className="text-gray-700 text-sm">{result.data.arxivMcp.url}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span className={result.data.arxivMcp.status === 200 ? 'text-green-600' : 'text-red-600'}>
                    {result.data.arxivMcp.status} {result.data.arxivMcp.statusText}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Token Status:</span>
                  <span className={result.data.arxivMcp.tokenValid ? 'text-green-600 font-semibold' : 'text-red-600'}>
                    {result.data.arxivMcp.tokenValid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sample Data */}
            {result.data.arxivMcp.sampleData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  📄 Sample arXiv Response
                </h3>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(result.data.arxivMcp.sampleData, null, 2)}
                </pre>
              </div>
            )}

            {/* Raw Response */}
            <details className="bg-gray-100 rounded-lg p-6">
              <summary className="cursor-pointer font-semibold text-gray-900">
                🔍 View Full Response
              </summary>
              <pre className="mt-4 text-xs overflow-auto bg-gray-900 text-green-400 p-4 rounded max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}


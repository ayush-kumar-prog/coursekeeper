import { NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client'

export async function GET() {
  try {
    const token = process.env.APIFY_API_TOKEN
    const arxivUrl = process.env.ARXIV_MCP_SERVER_URL
    const arxivToken = process.env.ARXIV_MCP_SERVER_TOKEN

    // Check if environment variables are set
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'APIFY_API_TOKEN not found in environment variables'
      }, { status: 500 })
    }

    if (!arxivUrl || !arxivToken) {
      return NextResponse.json({
        success: false,
        error: 'arXiv MCP server config not found in environment variables'
      }, { status: 500 })
    }

    // Initialize Apify client
    const client = new ApifyClient({ token })

    // Test 1: Get user info to verify token works
    console.log('🔍 Testing Apify API token...')
    const user = await client.user().get()
    
    console.log('✅ Apify token valid! User:', user?.username)

    // Test 2: Try to fetch a simple arXiv paper
    console.log('🔍 Testing arXiv MCP server...')
    const arxivResponse = await fetch(`${arxivUrl}?query=deep+learning&max_results=1`, {
      headers: {
        'Authorization': `Bearer ${arxivToken}`
      }
    })

    const arxivData = await arxivResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Apify connection successful!',
      data: {
        apify: {
          username: user?.username,
          email: user?.email,
          tokenValid: true
        },
        arxivMcp: {
          url: arxivUrl,
          status: arxivResponse.status,
          statusText: arxivResponse.statusText,
          tokenValid: arxivResponse.ok,
          sampleData: arxivData
        }
      }
    })

  } catch (error) {
    console.error('❌ Error testing Apify:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
  }
}


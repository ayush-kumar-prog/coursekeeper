import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            📚 CourseKeeper
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            Syllabus Patch Notes for Lifelong Learners
          </p>
          <p className="text-lg text-gray-500">
            Track how your field has evolved since you studied it
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              How It Works
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Upload your old syllabus/course materials</li>
              <li>• AI extracts baseline topics you studied</li>
              <li>• Annual patch notes show what&apos;s changed</li>
              <li>• Get a curated learning path to catch up</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Core Features
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Diff Engine: Detect field changes</li>
              <li>• Patch Writer: Generate summaries</li>
              <li>• Delta Path: Personalized learning</li>
              <li>• Citations: Research-backed updates</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900 text-center">
            🚀 Quick Start
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Test the API</h4>
                <p className="text-gray-600">
                  Visit the test page to see patch notes generation in action
                </p>
                <Link
                  href="/test"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Go to Test Page →
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Check the API</h4>
                <p className="text-gray-600 font-mono text-sm mt-1">
                  POST /api/runs - Generate patch notes
                </p>
                <code className="block mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                  {`curl -X POST http://localhost:3000/api/runs -H "Content-Type: application/json" -d '{"subjectId": "test", "year": 2014}'`}
                </code>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Database Status</h4>
                <p className="text-gray-600">
                  ✅ Prisma schema set up
                  <br />
                  ✅ Supabase connected
                  <br />
                  ✅ Models ready: User, Subject, YearRun, YearDiff
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Built for hackathon • Using OpenAI, Senso, Apify
          </p>
        </div>
      </div>
    </div>
  );
}

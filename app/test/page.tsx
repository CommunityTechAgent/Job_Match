import { SupabaseTest } from "@/components/debug/supabase-test"

export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Supabase Setup Test</h1>
          <p className="text-slate-600">Use this page to test your Supabase configuration</p>
        </div>

        <SupabaseTest />

        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">1. Check Environment Variables</h3>
              <p className="text-slate-600">
                Make sure your <code>.env.local</code> file contains:
              </p>
              <pre className="bg-slate-100 p-2 rounded mt-2">
                {`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium">2. Create Tables</h3>
              <p className="text-slate-600">
                Go to your Supabase dashboard → SQL Editor → Run the simplified SQL scripts
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Enable Authentication</h3>
              <p className="text-slate-600">Go to Authentication → Settings → Enable email authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

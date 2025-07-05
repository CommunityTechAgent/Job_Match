export default function EnvTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET"}
          </pre>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
              `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
              "NOT SET"
            }
          </pre>
        </div>
        <div>
          <strong>All Environment Variables:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
            {Object.keys(process.env)
              .filter(key => key.startsWith('NEXT_PUBLIC_'))
              .map(key => `${key}=${process.env[key]}`)
              .join('\n')}
          </pre>
        </div>
      </div>
    </div>
  )
}

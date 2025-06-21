export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
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
      </div>
    </div>
  )
} 
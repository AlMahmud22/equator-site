/**
 * Server-side protected route example
 */
export default async function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Server-Side Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-lg mb-2">Server Information</h3>
            <div>
              <p><strong>Route Type:</strong> Server-side protected</p>
              <p><strong>Authentication:</strong> Simplified for demo</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-lg mb-2">Account Status</h3>
            <div>
              <p className="text-green-600">
                ✅ Demo authentication active
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This is a simplified demo page.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800 mb-2">Server-Side Protection</h3>
          <p className="text-green-700 text-sm">
            This page demonstrates server-side route protection. Authentication 
            checks happen on the server before the page is rendered.
          </p>
        </div>
      </div>
    </div>
  );
}

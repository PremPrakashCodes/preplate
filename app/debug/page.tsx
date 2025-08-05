"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { user, restaurant, userType, token, loading } = useAuth();
  const [testResult, setTestResult] = useState<{ authenticated?: boolean; error?: string; user?: Record<string, unknown>; cookies?: Record<string, unknown> } | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const testAuth = async () => {
    setLoadingTest(true);
    try {
      const response = await fetch("/api/auth/test");
      const data = await response.json();
      setTestResult(data);
    } catch {
      setTestResult({ error: "Failed to test auth" });
    } finally {
      setLoadingTest(false);
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Side State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Client Side State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? "Yes" : "No"}</div>
              <div><strong>User Type:</strong> {userType || "None"}</div>
              <div><strong>Token:</strong> {token ? "Exists" : "None"}</div>
              <div><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : "None"}</div>
              <div><strong>Restaurant:</strong> {restaurant ? JSON.stringify(restaurant, null, 2) : "None"}</div>
            </div>
          </div>

          {/* Server Side Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Server Side Test</h2>
            <div className="space-y-2 text-sm">
              {loadingTest ? (
                <div>Testing authentication...</div>
              ) : testResult ? (
                <div>
                  <div><strong>Authenticated:</strong> {testResult.authenticated ? "Yes" : "No"}</div>
                  {testResult.error && <div><strong>Error:</strong> {testResult.error}</div>}
                  {testResult.user && <div><strong>User:</strong> {JSON.stringify(testResult.user, null, 2)}</div>}
                  {testResult.cookies && <div><strong>Cookies:</strong> {JSON.stringify(testResult.cookies, null, 2)}</div>}
                </div>
              ) : (
                <div>No test result</div>
              )}
            </div>
            <button 
              onClick={testAuth}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Again
            </button>
          </div>
        </div>

        {/* Local Storage */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Token:</strong> {typeof window !== 'undefined' ? localStorage.getItem("token") ? "Exists" : "None" : "N/A"}</div>
            <div><strong>User Type:</strong> {typeof window !== 'undefined' ? localStorage.getItem("userType") || "None" : "N/A"}</div>
            <div><strong>User Data:</strong> {typeof window !== 'undefined' ? localStorage.getItem("user") || "None" : "N/A"}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 
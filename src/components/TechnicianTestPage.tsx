import React from 'react';
import { CreateTechnicianForm } from './CreateTechnicianForm';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, User } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '@/contexts/AuthContext';


export function TechnicianTestPage() {
  const { user, isAuthenticated } = useAuth();

  const handleSuccess = () => {
    console.log('Technician created successfully!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Technician Creation Test</h1>
        <p className="text-gray-600">Test the new edge function for creating technicians</p>
      </div>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Authenticated as: {user?.email} 
                <Badge variant="outline" className="ml-2">{user?.role}</Badge>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Not authenticated - please log in first
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Edge Function Info */}
      <Card>
        <CardHeader>
          <CardTitle>Edge Function Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Function Name:</strong> create-technician
            </div>
            <div>
              <strong>Method:</strong> POST
            </div>
            <div>
              <strong>Authentication:</strong> JWT Token Required
            </div>
            <div>
              <strong>Service Role:</strong> Server-side only
            </div>
          </div>
          <div className="mt-4">
            <strong>Expected Payload:</strong>
            <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
{`{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "tech"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Create Technician Form */}
      <div className="flex justify-center">
        <CreateTechnicianForm onSuccess={handleSuccess} />
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-1">
            <li>Ensure you are logged in with admin privileges</li>
            <li>Fill out the form with valid technician details</li>
            <li>Click "Generate" to create a secure password</li>
            <li>Submit the form to test the edge function</li>
            <li>Check the response for success/error messages</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <strong>Error Handling:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>409 Conflict: Email already exists</li>
              <li>400 Bad Request: Missing required fields</li>
              <li>500 Internal Server Error: Server-side issues</li>
              <li>401 Unauthorized: Authentication required</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
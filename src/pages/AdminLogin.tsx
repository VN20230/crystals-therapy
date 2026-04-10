import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Lock } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Check credentials
      if (username === 'admin' && password === 'admin123') {
        // Store admin session in localStorage
        localStorage.setItem('adminSession', JSON.stringify({
          authenticated: true,
          timestamp: Date.now(),
        }));
        // Redirect to dashboard
        setLocation('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card p-8 rounded-lg border border-border">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-light tracking-widest text-foreground mb-2">
            Admin Login
          </h1>
          <p className="text-muted-foreground font-light tracking-wide">
            Access the management dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-foreground font-light tracking-wide mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              placeholder="Enter username"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-foreground font-light tracking-wide mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
              placeholder="Enter password"
              aria-required="true"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50 px-6 py-3 rounded-lg font-light tracking-wide transition-all"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-light mt-6">
          Authorized personnel only
        </p>
      </Card>
    </div>
  );
}

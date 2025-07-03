
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { APP_TITLE } from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
      } else if (user.role === UserRole.OFFICER) {
        navigate('/officer/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ministry-blue to-ministry-green p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <img src="../assets/logo.png" alt="Ministry Logo" className="mx-auto mb-2 h-24 object-cover"/>
          <h2 className="text-2xl font-bold text-gray-800">{APP_TITLE}</h2>
          <p className="text-gray-600">Staff Login</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm" role="alert">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Email Address" 
            id="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="your.email@ministry.gov.ag"
          />
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
          <div>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : 'Sign In'}
            </Button>
          </div>
        </form>
        <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-ministry-blue hover:underline">
                Back to Public Ticket Submission
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

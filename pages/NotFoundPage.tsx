
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <img src="https://picsum.photos/seed/404page/300/200" alt="Lost signal" className="w-64 h-auto mb-8 rounded-lg shadow-lg"/>
      <h1 className="text-6xl font-bold text-ministry-blue mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">Oops! Page Not Found.</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg">
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-sage text-cream flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full p-8 bg-forest border border-line rounded-3xl shadow-card space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-forest-dark border border-line flex items-center justify-center text-orange mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-xs text-orange tracking-normalst font-bold">
            ERROR 404
          </span>
          <h1 className="font-display text-4xl tracking-normal text-cream mt-1">
            Page Not Stashed
          </h1>
          <p className="text-xs text-cream-dim mt-2 leading-relaxed">
            The page or document you are looking for does not exist in your local stash or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="secondary" size="sm" icon={<Home className="w-4 h-4" />}>
              Home
            </Button>
          </Link>
          <Link to="/app">
            <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Open Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

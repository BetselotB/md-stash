import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Landing } from './routes/Landing';
import { Library } from './routes/Library';
import { CollectionView } from './routes/CollectionView';
import { FileDetail } from './routes/FileDetail';
import { Settings } from './routes/Settings';
import { Privacy } from './routes/Privacy';
import { DevFonts } from './routes/DevFonts';
import { NotFound } from './routes/NotFound';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Landing */}
          <Route path="/" element={<Landing />} />

          {/* Public Privacy Policy */}
          <Route path="/privacy" element={<Privacy />} />

          {/* Dev Font Comparison Route */}
          <Route path="/dev/fonts" element={<DevFonts />} />

          {/* Main Local-first Application */}
          <Route path="/app" element={<Shell />}>
            <Route index element={<Library />} />
            <Route path="c/:collectionId" element={<CollectionView />} />
            <Route path="f/:fileId" element={<FileDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

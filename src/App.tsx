import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Landing } from './routes/Landing';
import { Library } from './routes/Library';
import { CollectionView } from './routes/CollectionView';
import { FileDetail } from './routes/FileDetail';
import { Settings } from './routes/Settings';
import { Privacy } from './routes/Privacy';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Landing */}
        <Route path="/" element={<Landing />} />

        {/* Public Privacy Policy */}
        <Route path="/privacy" element={<Privacy />} />

        {/* Main Local-first Application */}
        <Route path="/app" element={<Shell />}>
          <Route index element={<Library />} />
          <Route path="c/:collectionId" element={<CollectionView />} />
          <Route path="f/:fileId" element={<FileDetail />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFile, useCollection } from '../hooks/useDb';
import { FileDetailModal } from '../components/file/FileDetailModal';

export const FileDetail: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const file = useFile(fileId);
  const collection = useCollection(file?.collectionId || undefined);

  if (!file) {
    return (
      <div className="py-20 text-center text-cream-dim text-sm">
        File not found or loading...
      </div>
    );
  }

  return (
    <FileDetailModal
      file={file}
      collection={collection}
      onClose={() => navigate('/app')}
    />
  );
};

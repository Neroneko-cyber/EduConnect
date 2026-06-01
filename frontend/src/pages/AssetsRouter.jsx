import React from 'react';
import { useAuth } from '../context/AuthContext';
import AssetsGuru from './AssetsGuru';
import AssetsTU from './AssetsTU';
import AssetsKepsek from './AssetsKepsek';

const AssetsRouter = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'GURU':
      return <AssetsGuru />;
    case 'TU':
      return <AssetsTU />;
    case 'KEPALA_SEKOLAH':
      return <AssetsKepsek />;
    default:
      return <div className="p-8">Akses ditolak.</div>;
  }
};

export default AssetsRouter;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '../components/AdminDashboard';
import { CreatePostForm } from '../components/CreatePostForm';

/**
 * Admin section with dashboard and post management
 */
export const AdminPage: React.FC = () => {
  return (
    <div className="admin-page">
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/posts/new" element={<CreatePostForm />} />
        <Route path="/posts/:id/edit" element={<CreatePostForm />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </div>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SignUpPage } from './pages/SignUpPage';
import { RelationMapPage } from './pages/RelationMapPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<Layout />}>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<RelationMapPage />} />
          <Route path="/" element={<Navigate to="/projects" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

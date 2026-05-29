import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public pages
import Home from '@/pages/Home';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AppLayout from '@/components/layout/AppLayout';
import AdminRoute from '@/components/layout/AdminRoute';

// Authenticated user pages
import Dashboard from '@/pages/app/Dashboard';
import Projects from '@/pages/app/Projects';
import NewProject from '@/pages/app/NewProject';
import ProjectDetail from '@/pages/app/ProjectDetail';
import ProjectOverview from '@/pages/app/ProjectOverview';
import BlueprintViewer from '@/pages/app/BlueprintViewer';
import PromptPackViewer from '@/pages/app/PromptPackViewer';
import SecurityReview from '@/pages/app/SecurityReview';
import QAChecklist from '@/pages/app/QAChecklist';
import Settings from '@/pages/app/Settings';
import Help from '@/pages/app/Help';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminBlueprints from '@/pages/admin/AdminBlueprints';
import AdminLogs from '@/pages/admin/AdminLogs';
import AdminTemplates from '@/pages/admin/AdminTemplates';
import AdminSettings from '@/pages/admin/AdminSettings';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<PublicLayout />}>
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>
      <Route path="/" element={<Home />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectOverview />} />
            <Route path="blueprint" element={<BlueprintViewer />} />
            <Route path="prompts" element={<PromptPackViewer />} />
            <Route path="security" element={<SecurityReview />} />
            <Route path="qa" element={<QAChecklist />} />
          </Route>
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/blueprints" element={<AdminBlueprints />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
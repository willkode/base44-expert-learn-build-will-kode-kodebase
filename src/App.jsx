import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/components/cart/CartContext';

// Public pages
import Home from '@/pages/Home';
import PromptEngine from '@/pages/tools/PromptEngine';
import PromptGenerator from '@/pages/tools/PromptGenerator';
import Features from '@/pages/Features';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Base44DesktopIde from '@/pages/products/Base44DesktopIde';
import Base44Porter from '@/pages/tools/Base44Porter';
import Contact from '@/pages/Contact';
import Tip from '@/pages/Tip';
import LearnIndex from '@/pages/learn/LearnIndex';
import Blog from '@/pages/learn/Blog';
import BlogPost from '@/pages/learn/BlogPost';
import BlogCategory from '@/pages/learn/BlogCategory';
import BlogTag from '@/pages/learn/BlogTag';
import PromptLibrary from '@/pages/learn/PromptLibrary';
import PromptPostDetail from '@/pages/learn/PromptPostDetail';
import AgentSkills from '@/pages/learn/AgentSkills';
import SuperAgent from '@/pages/learn/SuperAgent';
import AiControls from '@/pages/learn/AiControls';
import Videos from '@/pages/learn/Videos';

import LlmGuide from '@/pages/learn/LlmGuide';
import Base44ResourceHub from '@/pages/learn/Base44ResourceHub';
import Base44MasterClass from '@/pages/learn/Base44MasterClass';
import TermsOfService from '@/pages/legal/TermsOfService';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import RefundPolicy from '@/pages/legal/RefundPolicy';
import ServicesIndex from '@/pages/services/ServicesIndex';
import KodeSessions from '@/pages/services/KodeSessions';
import ErService from '@/pages/services/ErService';
import SecurityAudit from '@/pages/services/SecurityAudit';
import SeoAudit from '@/pages/services/SeoAudit';
import KodeCare from '@/pages/services/KodeCare';
import Base44Baas from '@/pages/services/Base44Baas';
import Base44Migration from '@/pages/services/Base44Migration';
import CustomAppCreation from '@/pages/services/CustomAppCreation';
import ServiceThankYou from '@/pages/services/ServiceThankYou';
import MigrationIntake from '@/pages/services/MigrationIntake';
import MigrationPlanner from '@/pages/migration/MigrationPlanner';
import MigrationDashboard from '@/pages/migration/MigrationDashboard';
import NewMigrationAssessment from '@/pages/migration/NewMigrationAssessment';
import MigrationProject from '@/pages/migration/MigrationProject';
import MigrationReport from '@/pages/migration/MigrationReport';
import MigrationQuote from '@/pages/migration/MigrationQuote';
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
import BundleDownloads from '@/pages/app/BundleDownloads';
import Projects from '@/pages/app/Projects';
import NewProject from '@/pages/app/NewProject';
import ProjectDetail from '@/pages/app/ProjectDetail';
import ProjectOverview from '@/pages/app/ProjectOverview';
import PromptPackViewer from '@/pages/app/PromptPackViewer';
import OptimizationPrompts from '@/pages/app/OptimizationPrompts';
import LaunchAudit from '@/pages/app/LaunchAudit';
import SecurityReview from '@/pages/app/SecurityReview';
import QAChecklist from '@/pages/app/QAChecklist';
import Settings from '@/pages/app/Settings';
import Checkout from '@/pages/Checkout';
import Download from '@/pages/Download';
import ServiceOnboarding from '@/pages/ServiceOnboarding';
import BuyMeACoffee from '@/pages/BuyMeACoffee';
import Help from '@/pages/app/Help';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminLogs from '@/pages/admin/AdminLogs';
import AdminTemplates from '@/pages/admin/AdminTemplates';
import AdminVideos from '@/pages/admin/AdminVideos';
import AdminMarketing from '@/pages/admin/AdminMarketing';
import AdminPromptLibrary from '@/pages/admin/AdminPromptLibrary';
import BlogMarketingLayout from '@/components/admin/blog/BlogMarketingLayout';
import BlogDashboard from '@/pages/admin/blog/BlogDashboard';
import BlogPosts from '@/pages/admin/blog/BlogPosts';
import BlogApprovals from '@/pages/admin/blog/BlogApprovals';
import BlogEditor from '@/pages/admin/blog/BlogEditor';
import BlogGenerator from '@/pages/admin/blog/BlogGenerator';
import BlogCalendar from '@/pages/admin/blog/BlogCalendar';
import BlogPlans from '@/pages/admin/blog/BlogPlans';
import BlogKeywords from '@/pages/admin/blog/BlogKeywords';
import BlogTaxonomy from '@/pages/admin/blog/BlogTaxonomy';
import BlogInternalLinking from '@/pages/admin/blog/BlogInternalLinking';
import BlogRefresh from '@/pages/admin/blog/BlogRefresh.jsx';
import BlogAnalytics from '@/pages/admin/blog/BlogAnalytics';
import BlogLogs from '@/pages/admin/blog/BlogLogs';
import BlogSettings from '@/pages/admin/blog/BlogSettings.jsx';
import EmailMarketingLayout from '@/components/admin/email/EmailMarketingLayout';
import EmailDashboard from '@/pages/admin/email/EmailDashboard';
import EmailContacts from '@/pages/admin/email/EmailContacts';
import EmailContactProfile from '@/pages/admin/email/EmailContactProfile';
import EmailLists from '@/pages/admin/email/EmailLists';
import EmailSegments from '@/pages/admin/email/EmailSegments';
import EmailCampaigns from '@/pages/admin/email/EmailCampaigns';
import EmailStudio from '@/pages/admin/email/EmailStudio';
import EmailCalendar from '@/pages/admin/email/EmailCalendar';
import EmailAutomations from '@/pages/admin/email/EmailAutomations';
import EmailAnalytics from '@/pages/admin/email/EmailAnalytics';
import EmailResendSettings from '@/pages/admin/email/EmailResendSettings';
import EmailSuppressionPage from '@/pages/admin/email/EmailSuppressionPage';
import EmailLogs from '@/pages/admin/email/EmailLogs';
import OcoyaSocial from '@/pages/admin/ocoya/OcoyaSocial';
import SecurityDashboard from '@/pages/admin/security/SecurityDashboard';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminSales from '@/pages/admin/AdminSales';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminDownloadLogs from '@/pages/admin/AdminDownloadLogs';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminPromptVault from '@/pages/admin/AdminPromptVault';
import AdminAgentSkills from '@/pages/admin/AdminAgentSkills';
import AdminAnalyticsPlan from '@/pages/admin/AdminAnalyticsPlan';
import AdminSitemap from '@/pages/admin/AdminSitemap';
import AdminMigrationPlanner from '@/pages/admin/AdminMigrationPlanner';
import PromptVault from '@/pages/PromptVault';
import VaultAccess from '@/pages/VaultAccess';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<PublicLayout />}>
        <Route path="/learn" element={<LearnIndex />} />
        <Route path="/features" element={<Features />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/base44-desktop-ide" element={<Base44DesktopIde />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/tip" element={<Tip />} />
        <Route path="/learn/blog" element={<Blog />} />
        <Route path="/learn/blog/category/:slug" element={<BlogCategory />} />
        <Route path="/learn/blog/tag/:slug" element={<BlogTag />} />
        <Route path="/learn/blog/:slug" element={<BlogPost />} />
        <Route path="/learn/prompt-library" element={<PromptLibrary />} />
        <Route path="/learn/prompt-library/:slug" element={<PromptPostDetail />} />
        <Route path="/learn/agent-skills" element={<AgentSkills />} />
        <Route path="/learn/superagent" element={<SuperAgent />} />
        <Route path="/learn/ai-controls" element={<AiControls />} />
        <Route path="/learn/videos" element={<Videos />} />

        <Route path="/learn/llm-guide" element={<LlmGuide />} />
        <Route path="/learn/base44-cheat-sheet" element={<Base44ResourceHub />} />
        <Route path="/learn/base44-master-class" element={<Base44MasterClass />} />
        <Route path="/learn/base44" element={<Navigate to="/learn/base44-cheat-sheet" replace />} />
        <Route path="/services" element={<ServicesIndex />} />
        <Route path="/services/kode-sessions" element={<KodeSessions />} />
        <Route path="/services/er-service" element={<ErService />} />
        <Route path="/services/security-audit" element={<SecurityAudit />} />
        <Route path="/services/seo-audit" element={<SeoAudit />} />
        <Route path="/services/kodecare" element={<KodeCare />} />
        <Route path="/services/base44-baas" element={<Base44Baas />} />
        <Route path="/services/base44-migration" element={<Base44Migration />} />
        <Route path="/services/custom-app-creation" element={<CustomAppCreation />} />
        <Route path="/services/thank-you" element={<ServiceThankYou />} />
        <Route path="/services/migration-intake" element={<MigrationIntake />} />
        <Route path="/migration-planner" element={<MigrationPlanner />} />
        <Route path="/tools/base44-frontend-porter" element={<Base44Porter />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
      </Route>
      <Route path="/" element={<Home />} />
      <Route path="/tools/prompt-generator" element={<PromptGenerator />} />
      <Route path="/vault" element={<PromptVault />} />
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/service-onboarding" element={<ServiceOnboarding />} />
        <Route path="/coffee" element={<BuyMeACoffee />} />
        <Route path="/download/:productId" element={<Download />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bundle-downloads" element={<BundleDownloads />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<NewProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ProjectOverview />} />
            <Route path="prompts" element={<PromptPackViewer />} />
            <Route path="optimize" element={<OptimizationPrompts />} />
            <Route path="security" element={<SecurityReview />} />
            <Route path="qa" element={<QAChecklist />} />
            <Route path="launch-audit" element={<LaunchAudit />} />
          </Route>
          <Route path="/tools/prompt-engine" element={<PromptEngine />} />
          <Route path="/migration-planner/assessments" element={<MigrationDashboard />} />
          <Route path="/migration-planner/new" element={<NewMigrationAssessment />} />
          <Route path="/migration-planner/projects/:id" element={<MigrationProject />} />
          <Route path="/migration-planner/projects/:id/report" element={<MigrationReport />} />
          <Route path="/migration-planner/projects/:id/quote" element={<MigrationQuote />} />
          <Route path="/vault/access" element={<VaultAccess />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/videos" element={<AdminVideos />} />
            <Route path="/admin/marketing" element={<AdminMarketing />} />
            <Route path="/admin/marketing/prompt-library" element={<AdminPromptLibrary />} />
            <Route path="/admin/marketing/blog" element={<BlogMarketingLayout />}>
              <Route index element={<BlogDashboard />} />
              <Route path="posts" element={<BlogPosts />} />
              <Route path="approvals" element={<BlogApprovals />} />
              <Route path="posts/new" element={<BlogEditor />} />
              <Route path="posts/:id/edit" element={<BlogEditor />} />
              <Route path="generator" element={<BlogGenerator />} />
              <Route path="calendar" element={<BlogCalendar />} />
              <Route path="plans" element={<BlogPlans />} />
              <Route path="keywords" element={<BlogKeywords />} />
              <Route path="taxonomy" element={<BlogTaxonomy />} />
              <Route path="internal-linking" element={<BlogInternalLinking />} />
              <Route path="refresh" element={<BlogRefresh />} />
              <Route path="analytics" element={<BlogAnalytics />} />
              <Route path="logs" element={<BlogLogs />} />
              <Route path="settings" element={<BlogSettings />} />
            </Route>
            <Route path="/admin/marketing/email" element={<EmailMarketingLayout />}>
              <Route index element={<EmailDashboard />} />
              <Route path="contacts" element={<EmailContacts />} />
              <Route path="contacts/:id" element={<EmailContactProfile />} />
              <Route path="lists" element={<EmailLists />} />
              <Route path="segments" element={<EmailSegments />} />
              <Route path="campaigns" element={<EmailCampaigns />} />
              <Route path="studio" element={<EmailStudio />} />
              <Route path="calendar" element={<EmailCalendar />} />
              <Route path="automations" element={<EmailAutomations />} />
              <Route path="analytics" element={<EmailAnalytics />} />
              <Route path="suppression" element={<EmailSuppressionPage />} />
              <Route path="logs" element={<EmailLogs />} />
              <Route path="settings" element={<EmailResendSettings />} />
            </Route>
            <Route path="/admin/marketing/social/*" element={<OcoyaSocial />} />
            <Route path="/admin/security" element={<SecurityDashboard />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/download-logs" element={<AdminDownloadLogs />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/prompt-vault" element={<AdminPromptVault />} />
            <Route path="/admin/agent-skills" element={<AdminAgentSkills />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPlan />} />
            <Route path="/admin/migration-planner" element={<AdminMigrationPlanner />} />
            <Route path="/admin/sitemap" element={<AdminSitemap />} />
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
        <CartProvider>
          <Router>
            <ScrollToTop />
            <GoogleAnalytics />
            <AuthenticatedApp />
          </Router>
        </CartProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
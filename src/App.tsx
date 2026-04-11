import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import GlobalDesignProvider from "@/components/GlobalDesignProvider";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MarketplacePage from "./pages/MarketplacePage";
import CourseDetailPage from "./pages/CourseDetailPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanel from "./pages/AdminPanel";
import CourseLearningPage from "./pages/CourseLearningPage";
import EbooksPage from "./pages/EbooksPage";
import EbookDetailPage from "./pages/EbookDetailPage";
import EbookReaderPage from "./pages/EbookReaderPage";
import FilesPage from "./pages/FilesPage";
import FileDetailPage from "./pages/FileDetailPage";
import FileDownloadPage from "./pages/FileDownloadPage";
import NewsPage from "./pages/NewsPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GlobalDesignProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/course/:id" element={<CourseDetailPage />} />
              <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/learn/:id" element={<CourseLearningPage />} />
              <Route path="/ebooks" element={<EbooksPage />} />
              <Route path="/ebook/:id" element={<EbookDetailPage />} />
              <Route path="/read-ebook/:id" element={<EbookReaderPage />} />
              <Route path="/files" element={<FilesPage />} />
              <Route path="/file/:id" element={<FileDetailPage />} />
              <Route path="/download-file/:id" element={<FileDownloadPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </GlobalDesignProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

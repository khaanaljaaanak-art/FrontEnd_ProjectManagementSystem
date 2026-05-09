import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NotificationPollerProvider } from "./context/NotificationPollerContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayoutPage from "./pages/admin/AdminLayoutPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminAssessmentProjectSelectPage from "./pages/admin/assessments/AdminAssessmentProjectSelectPage";
import AdminAssessmentTimelinePage from "./pages/admin/assessments/AdminAssessmentTimelinePage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import ForumListPage from "./pages/forum/ForumListPage";
import ForumThreadPage from "./pages/forum/ForumThreadPage";
import SupervisorLayoutPage from "./pages/supervisor/SupervisorLayoutPage";
import SupervisorGradingPage from "./pages/supervisor/SupervisorGradingPage";
import SupervisorStudentsPage from "./pages/supervisor/SupervisorStudentsPage";
import SupervisorHistoryPage from "./pages/supervisor/SupervisorHistoryPage";
import SupervisorCommunicationPage from "./pages/supervisor/SupervisorCommunicationPage";
import StudentLayoutPage from "./pages/student/StudentLayoutPage";
import StudentOverviewPage from "./pages/student/StudentOverviewPage";
import StudentSubmissionPage from "./pages/student/StudentSubmissionPage";
import StudentMarksPage from "./pages/student/StudentMarksPage";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage";
import StudentCommunicationPage from "./pages/student/StudentCommunicationPage";
import StudentHistoryPage from "./pages/student/StudentHistoryPage";

function App() {
  return (
    <BrowserRouter>
      <NotificationPollerProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4500 }} />
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayoutPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="projects" replace />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="assessments" element={<Navigate to="assessments/select" replace />} />
          <Route path="assessments/select" element={<AdminAssessmentProjectSelectPage />} />
          <Route path="assessments/:projectId/timeline" element={<AdminAssessmentTimelinePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="forum" element={<ForumListPage />} />
          <Route path="forum/:discussionId" element={<ForumThreadPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>

        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={["supervisor"]}>
              <SupervisorLayoutPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="grading" replace />} />
          <Route path="grading" element={<SupervisorGradingPage />} />
          <Route path="students" element={<SupervisorStudentsPage />} />
          <Route path="history" element={<SupervisorHistoryPage />} />
          <Route path="forum" element={<ForumListPage />} />
          <Route path="forum/:discussionId" element={<ForumThreadPage />} />
          <Route path="communication" element={<SupervisorCommunicationPage />} />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayoutPage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<StudentOverviewPage />} />
          <Route path="submission" element={<StudentSubmissionPage />} />
          <Route path="marks" element={<StudentMarksPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="forum" element={<ForumListPage />} />
          <Route path="forum/:discussionId" element={<ForumThreadPage />} />
          <Route path="communication" element={<StudentCommunicationPage />} />
          <Route path="history" element={<StudentHistoryPage />} />
        </Route>
        </Routes>
      </NotificationPollerProvider>
    </BrowserRouter>
  );
}

export default App;

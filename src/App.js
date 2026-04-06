import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayoutPage from "./pages/admin/AdminLayoutPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminAssessmentsPage from "./pages/admin/AdminAssessmentsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminDisputesPage from "./pages/admin/AdminDisputesPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
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
          <Route path="assessments" element={<AdminAssessmentsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="disputes" element={<AdminDisputesPage />} />
          <Route path="activity" element={<AdminActivityPage />} />
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
          <Route path="communication" element={<StudentCommunicationPage />} />
          <Route path="history" element={<StudentHistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

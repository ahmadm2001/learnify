// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

import NavBar from "./components/NavBar";
import ProtectedRoute from "./ProtectedRoute";
import { isLoggedIn } from "./lib/auth";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

// Account pages
import Account from "./pages/Account";
import EditProfile from "./pages/EditProfile";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeacherApps from "./pages/AdminTeacherApps";
import AdminCourses from "./pages/admin/AdminCourses";

// Student
import StudentCourses from "./pages/student/Courses";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";
import Cart from "./pages/student/Cart";
import BillingPage from "./pages/student/BillingPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentLayout from "./components/StudentLayout";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentEnrolledCourses from "./pages/student/StudentEnrolledCourses";
import StudentFeed from "./pages/student/StudentFeed";
import Compiler from "./pages/student/Compiler"; // ✅ compiler
import StudentQuizAttempt from "./pages/student/StudentQuizAttempt";
import StudentAssignmentDetail from "./pages/student/StudentAssignmentDetail";
import PaymentSuccess from "./pages/student/PaymentSuccess";
// Teacher registration flow
import ApplyTeacher from "./pages/ApplyTeacher";
import TeacherRegister from "./pages/TeacherRegister";
import TeacherStatus from "./pages/TeacherStatus";

// Instructor
import InstructorLayout from "./components/InstructorLayout";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorCourseEdit from "./pages/instructor/InstructorCourseEdit";
import CreateCourseWizard from "./pages/instructor/CreateCourseWizard";
import Enrollments from "./pages/instructor/Enrollments";
import InstructorFeed from "./pages/instructor/InstructorFeed";
import QuizBuilder from "./pages/instructor/QuizBuilder";
import AssignmentsList from "./pages/instructor/AssignmentsList";
import QuizGrading from "./pages/instructor/QuizGrading";
import InstructorQuizzes from "./pages/instructor/InstructorQuizzes";
import QuizSubmissions from "./pages/instructor/QuizSubmissions";
import LiveSessionPage from "./pages/instructor/LiveSessionPage";
import ScheduleSessionPage from "./pages/instructor/ScheduleSessionPage";
import ScheduledSessionsPage from "./pages/instructor/ScheduledSessionsPage";
import CreateScheduleSessionPage from "./pages/instructor/CreateScheduleSessionPage";

// Admin Routes 
import AdminAllUsers from "./pages/admin/AdminAllUsers";

export default function App() {
  const logged = isLoggedIn();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        <Route
          path="/login"
          element={
            logged ? (
              <Navigate
                to={
                  localStorage.getItem("role") === "ADMIN"
                    ? "/admin-dashboard"
                    : localStorage.getItem("role") === "TEACHER_APPROVED"
                      ? "/instructor"
                      : "/account"
                }
                replace
              />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={logged ? <Navigate to="/account" /> : <Register />}
        />

        {/* ================= ACCOUNT ================= */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/users" element={<AdminAllUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />

        <Route
          path="/admin/teacher-apps"
          element={
            <ProtectedRoute>
              <AdminTeacherApps />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT PUBLIC ================= */}
        <Route path="/courses" element={<StudentCourses />} />
        <Route path="/student/courses/:id" element={<StudentCourseDetail />} />
        <Route path="/billing/:courseId" element={<BillingPage />} />
        <Route path="payment-success/:courseId" element={<PaymentSuccess />} />
        {/* ================= STUDENT (PROTECTED + LAYOUT) ================= */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="feed" element={<StudentFeed />} />
          <Route path="courses" element={<StudentEnrolledCourses />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="quiz/:quizId" element={<StudentQuizAttempt />} />
          <Route path="assignments/:assignmentId" element={<StudentAssignmentDetail />} />

          {/* ✅ COMPILER ROUTE (NEW) */}
          <Route path="compiler" element={<Compiler />} />
        </Route>

        {/* ================= CART ================= */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* ================= TEACHER REGISTRATION ================= */}
        <Route
          path="/teacher/register"
          element={
            <ProtectedRoute>
              <TeacherRegister />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/status"
          element={
            <ProtectedRoute>
              <TeacherStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply-teacher"
          element={
            <ProtectedRoute>
              <ApplyTeacher />
            </ProtectedRoute>
          }
        />

        {/* ================= INSTRUCTOR (PROTECTED + LAYOUT) ================= */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<InstructorDashboard />} />
          <Route path="feed" element={<InstructorFeed />} />

          <Route path="courses" element={<InstructorCourses />} />
          <Route path="courses/new" element={<CreateCourseWizard />} />
          <Route path="courses/:courseId/edit" element={<InstructorCourseEdit />} />

          <Route path="lectures/:lectureId/quiz" element={<QuizBuilder />} />

          <Route path="enrollments" element={<Enrollments />} />
          <Route path="assignments" element={<AssignmentsList />} />

          {/* ✅ QUIZ FLOW (NEW + CORRECT) */}
          <Route path="quizzes" element={<InstructorQuizzes />} />
          <Route
            path="quizzes/:quizId/submissions"
            element={<QuizSubmissions />}
          />
          <Route path="quizzes/:quizId/grade" element={<QuizGrading />} />
          <Route path="live-session/:lectureId" element={<LiveSessionPage />} />
          <Route path="schedule/:lectureId" element={<ScheduleSessionPage />} />
          <Route path="/instructor/scheduled-sessions" element={<ScheduledSessionsPage />} />
          <Route path="/instructor/create-schedule" element={<CreateScheduleSessionPage />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

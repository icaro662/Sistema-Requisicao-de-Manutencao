import { useAuthStore } from './store/authStore';
import { Navigate, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Shell from './layouts/Shell';
import ProtectedLayout from './layouts/ProtectedLayout';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const authenticated = useAuthStore((state) => Boolean(state.sessionEmail));
  return (
    <Routes>
      <Route
        path="/login"
        element={
          authenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          authenticated ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/*" element={<Shell />} />
      </Route>
      <Route
        path="*"
        element={
          <Navigate
            to={authenticated ? '/' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;

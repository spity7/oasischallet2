import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import AuthPage from "./pages/AuthPage";
import VerifyEmailCard from "./components/VerifyEmailCard";

const AppRoutes = () => {
  const user = useRecoilValue(userAtom);

  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" />} />
        <Route path="/verify-email" element={<VerifyEmailCard />} />
      </Routes>
    );
  }

  if (user.role && user.role.includes("Admin")) {
    return (
      <Routes>
        <Route path="/*" element={<AdminRoutes />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    );
  }

  if (user.role && user.role.includes("User")) {
    return (
      <Routes>
        <Route path="/*" element={<UserRoutes />} />
        <Route path="*" element={<Navigate to="/user" />} />
      </Routes>
    );
  }

  // Fallback for other roles or invalid states
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;

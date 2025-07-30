import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Dashboard from "../pages/Admin/Dashboard";
import NewBookingPage from "../pages/Admin/NewBookingPage";
import SettingsPage from "../pages/Admin/SettingsPage";
import UpdateProfilePage from "../pages/UpdateProfilePage";
import { HomeOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";

const menuItems = [
  {
    title: "Home",
    icon: <HomeOutlined />,
    path: "/user",
  },
  {
    title: "حجز جديد",
    icon: <PlusOutlined />,
    path: "/user/new-booking",
  },
  {
    title: "Settings",
    icon: <SettingOutlined />,
    path: "/user/settings",
  },
];

const UserRoutes = () => {
  const userRole = "User";

  return (
    <div style={{ display: "flex" }}>
      <Navbar menuItems={menuItems} />
      <Routes>
        <Route path="/user" element={<Dashboard />} />
        <Route path="/user/new-booking" element={<NewBookingPage />} />
        <Route
          path="/user/settings"
          element={<SettingsPage userRole={userRole} />}
        />
        <Route
          path="/user/settings/update-profile"
          element={<UpdateProfilePage />}
        />
        <Route path="*" element={<Navigate to="/user" />} />
      </Routes>
    </div>
  );
};

export default UserRoutes;

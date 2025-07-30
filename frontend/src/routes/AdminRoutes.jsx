import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CalendarPage from "../pages/Admin/CalendarPage";
import NewBookingPage from "../pages/Admin/NewBookingPage";

import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";

const menuItems = [
  {
    title: "حجز جديد",
    icon: <PlusOutlined />,
    path: "/admin/new-booking",
  },
  {
    title: "تقويم",
    icon: <CalendarOutlined />,
    path: "/admin",
  },
];

const AdminRoutes = () => {
  return (
    <div style={{ display: "flex" }}>
      <Navbar menuItems={menuItems} />
      <Routes>
        <Route path="/admin" element={<CalendarPage />} />
        <Route path="/admin/new-booking" element={<NewBookingPage />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </div>
  );
};

export default AdminRoutes;

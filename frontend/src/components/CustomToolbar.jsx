import React from "react";

const CustomToolbar = ({ onNavigate }) => (
  <div className="rbc-toolbar" style={{ direction: "rtl", textAlign: "center" }}>
    <div className="rbc-btn-group">
      <button onClick={() => onNavigate("NEXT")}>التالي</button>
      <button onClick={() => onNavigate("TODAY")}>اليوم</button>
      <button onClick={() => onNavigate("PREV")}>السابق</button>
    </div>
  </div>
);

export default CustomToolbar;

import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import GlobalLayout from "../../styles/GlobalLayout";

// Unterseiten die je nach Rolle angezeigt werden sollen
const roleSettings = {
  Admin: [
    { name: "Update Profile", path: "/admin/settings/update-profile" },
    { name: "Employee Overview", path: "/admin/settings/employee-overview" },
  ],
  User: [{ name: "Update Profile", path: "/user/settings/update-profile" }],
};

const SettingsPage = ({ userRole }) => {
  const settingsOptions = roleSettings[userRole] || [];

  return (
    <GlobalLayout>
      <CenteredContainer>
        <h2>Settings</h2>
        <List>
          {settingsOptions.map((option) => (
            <ListItem key={option.path}>
              <StyledLink to={option.path}>{option.name}</StyledLink>
            </ListItem>
          ))}
        </List>
      </CenteredContainer>
    </GlobalLayout>
  );
};

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 10px 0px;
  color: #222260;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 10px;

  &:hover {
    background-color: #f0f0f0;
    color: #000;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;

  &:hover {
    background-color: #f0f0f0;
    color: #000;
  }
`;

export default SettingsPage;

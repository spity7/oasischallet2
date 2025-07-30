import React, { useState } from "react";
import styled, { css } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/globalContext";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import logo from "../assets/img/logo.png";

const Navbar = ({ menuItems }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const { handleLogout } = useGlobalContext();

  const handleMenuItemClick = (path) => {
    navigate(path);
    setIsCollapsed(true);
  };

  const handleSubmit = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.log(error.message);
    }
  };

  // Function to navigate to /admin when logo is clicked
  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <NavbarContainer>
      <NavContent>
        <LeftSection>
          <Logo src={logo} alt="Logo" onClick={handleLogoClick} />
        </LeftSection>
        <RightSection>
          <CollapseButton
            onClick={handleCollapseToggle}
            isCollapsed={isCollapsed}
          >
            <MenuOutlined rotate={isCollapsed ? 180 : 0} />
          </CollapseButton>
        </RightSection>
      </NavContent>
      <MenuItemsContainer isCollapsed={isCollapsed}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={() => handleMenuItemClick(item.path)}>
            {item.icon}
            <span>{item.title}</span>
          </MenuItem>
        ))}
        <LogoutButton onClick={handleSubmit}>
          <LogoutOutlined />
          <span>تسجيل خروج</span>
        </LogoutButton>
      </MenuItemsContainer>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 100px;
  height: 80px;

  @media (max-width: 768px) {
    padding: 0px 30px;
    height: 60px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  height: 60px;
  cursor: pointer; /* Make it clear the logo is clickable */

  @media (max-width: 768px) {
    height: 50px;
  }
`;

const CollapseButton = styled.div`
  cursor: pointer;
  transition: transform 0.3s;

  ${(props) =>
    props.isCollapsed &&
    css`
      transform: rotate(-180deg);
    `}

  svg {
    font-size: 26px;
    color: #009782;
  }
`;

const MenuItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px;
  position: absolute;
  top: 80px;
  right: 100px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  visibility: ${({ isCollapsed }) => (isCollapsed ? "hidden" : "visible")};
  transform: ${({ isCollapsed }) =>
    isCollapsed ? "translateY(-20px)" : "translateY(0)"};
  transition: opacity 0.3s, transform 0.3s, visibility 0.3s;
  width: 250px;

  @media (max-width: 768px) {
    right: 30px;
    top: 60px;
    width: 200px;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s;
  border-radius: 10px;
  font-weight: 600;

  &:hover {
    background-color: #f0f0f0;
  }

  svg {
    font-size: 24px;
    margin-right: 10px;
  }

  span {
    display: inline;
  }
`;

const LogoutButton = styled(MenuItem)`
  background: transparent;

  &:hover {
    background: transparent;
    color: red;

    svg {
      color: #a80303;
    }

    span {
      color: #a80303;
    }
  }
`;

export default Navbar;

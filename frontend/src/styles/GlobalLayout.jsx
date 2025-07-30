import React from "react";
import styled from "styled-components";

const GlobalLayout = ({ children }) => {
  return <LayoutContainer>{children}</LayoutContainer>;
};

const LayoutContainer = styled.div`
  margin: 0 auto;
  min-height: 100vh;
  width: 100%;
  max-width: 1700px;
  padding-top: 90px;
  box-sizing: border-box;
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 768px) {
    padding-top: 70px;
    max-width: 100%;
  }
`;

export default GlobalLayout;

// for debugging flexbox
// eslint-disable-next-line 
{
  /*border: 2px dashed red; // Added border for debugging
  background-color: rgba(
    255,
    0,
    0,
    0.1
  ); // Added background color for debugging*/
}

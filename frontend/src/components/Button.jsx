import React from "react";
import styled from "styled-components";

function Button(props) {
  return (
    <ButtonStyled
      bg={props.bg}
      padding={props.padding}
      borderradius={props.borderradius}
      color={props.color}
      hoverbg={props.hoverBg}
      disabledcolor={props.disabledColor}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.icon}
      {props.name}
    </ButtonStyled>
  );
}

const ButtonStyled = styled.button`
  outline: none;
  border: none;
  font-family: inherit;
  font-size: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.4s ease-in-out;
  background: ${(props) => props.bg};
  padding: ${(props) => props.padding};
  border-radius: ${(props) => props.borderradius};
  color: ${(props) =>
    props.disabled ? props.disabledcolor || "#ccc" : props.color};
  max-width: 100%;

  &:hover {
    background: ${(props) =>
      props.disabled ? props.bg : props.hoverbg || props.bg};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: inherit;
    padding: ${(props) => props.padding};
  }
`;

export default Button;

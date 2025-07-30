import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../context/globalContext";
import styled from "styled-components";
import GlobalLayout from "../styles/GlobalLayout";
import useShowModal from "../hooks/useShowModal"; // Import the custom hook
import Button from "../components/Button";

const UpdateProfilePage = () => {
  const { fetchUserById, handleUpdateProfile } = useGlobalContext();
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    username: "",
  });
  const showModal = useShowModal(); // Initialize the custom hook
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user-app"))._id;
    const fetchData = async () => {
      try {
        const data = await fetchUserById(userId);
        setUserData({
          firstname: data.firstname,
          lastname: data.lastname,
          username: data.username,
        });
        setInitialData({
          firstname: data.firstname,
          lastname: data.lastname,
          username: data.username,
        }); // Setze die initialen Daten
      } catch (error) {
        showModal(
          "Error",
          "An error occurred while fetching user data.",
          "error"
        );
      }
    };

    fetchData();
  }, [fetchUserById, showModal]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = JSON.parse(localStorage.getItem("user-app"))._id;
    try {
      const response = await handleUpdateProfile(userId, userData);
      if (response.status === 200) {
        showModal("Success", "Profile updated successfully.", "success");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showModal("Error", error.response.data.error, "error");
      } else {
        showModal("Error", "An error occurred. Please try again.", "error");
      }
    }
  };

  const isFormDataChanged = () => {
    if (!initialData || !userData) return false; // Falls initialData oder userData noch nicht gesetzt sind, Button deaktivieren

    // Überprüfen, ob alle Felder ausgefüllt sind
    const areFieldsFilled = Object.values(userData).every(
      (value) => value.trim() !== ""
    );

    if (!areFieldsFilled) return false; // Wenn nicht alle Felder ausgefüllt sind, Button deaktivieren

    // Überprüfen, ob sich die Daten geändert haben
    return JSON.stringify(userData) !== JSON.stringify(initialData);
  };

  return (
    <GlobalLayout>
      <Container>
        <Title>Update Profile</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="firstname">First Name</Label>
            <Input
              type="text"
              id="firstname"
              name="firstname"
              value={userData.firstname}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              type="text"
              id="lastname"
              name="lastname"
              value={userData.lastname}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button
            bg="#2db4a0"
            padding="10px 20px"
            borderradius="5px"
            color="#ffffff"
            hoverBg="#009782"
            disabledColor="#c3eddf"
            name="Save"
            onClick={handleSubmit}
            disabled={!isFormDataChanged()}
          />
        </Form>
      </Container>
    </GlobalLayout>
  );
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h2`
  margin-bottom: 15px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #666;
`;

export const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 90%;

  &:focus {
    border-color: #007bff;
    outline: none;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.875rem;
    width: 90%;
  }
`;

export default UpdateProfilePage;

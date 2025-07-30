import React, { useEffect, useState } from "react";
import { Modal, Button, Input, Form, Select } from "antd";
import { useGlobalContext } from "../../context/globalContext";
import useShowModal from "../../hooks/useShowModal";

const UpdateEmployeeModal = ({ isVisible, onCancel, employee, roles }) => {
  const { handleUpdateEmployee } = useGlobalContext();
  const [form] = Form.useForm();
  const [isFormValid, setIsFormValid] = useState(false);
  const showModal = useShowModal();

  useEffect(() => {
    if (employee) {
      form.setFieldsValue(employee);
      // Check form validity on initial load
      const allFieldsTouched = form.getFieldsValue();
      setIsFormValid(
        Object.values(allFieldsTouched).every(
          (value) => value !== undefined && value !== ""
        )
      );
    }
  }, [employee, form]);

  const handleValuesChange = () => {
    // Check if form is valid when values change
    const values = form.getFieldsValue();
    setIsFormValid(
      Object.values(values).every(
        (value) => value !== undefined && value !== ""
      )
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const response = await handleUpdateEmployee(employee._id, values);

      // Wenn der Update-Vorgang erfolgreich war (Response-Code 200)
      if (response.status === 200) {
        showModal("Success", "Employee updated successfully", "success");
        onCancel(); // Schließe das Modal nur, wenn der Update-Vorgang erfolgreich war
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showModal("Error", error.response.data.error, "error");
      } else {
        showModal("Error", "An error occurred. Please try again.", "error");
      }
    }
  };

  return (
    <Modal
      title="Update Employee"
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>Cancel</Button>,
        <Button
          key="submit"
          color="black"
          type="primary"
          onClick={handleSave}
          disabled={!isFormValid} // Disable button if form is not valid or saving is in progress
        >Save</Button>,
      ]}
    >
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          label="First Name"
          name="firstname"
          rules={[{ required: true, message: "Please input the first name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastname"
          rules={[{ required: true, message: "Please input the last name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input the username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: "Please select the role!" }]}
        >
          <Select>
            {roles.map((role) => (
              <Select.Option key={role} value={role}>
                {role}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateEmployeeModal;

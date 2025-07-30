import React, { useState } from "react";
import { Modal, Button, Input, Form, Select } from "antd";
import { useGlobalContext } from "../../context/globalContext";

const AddEmployeeModal = ({ isVisible, onCancel, roles }) => {
  const [form] = Form.useForm();
  const [isFormValid, setIsFormValid] = useState(false);
  const { addEmployee } = useGlobalContext();

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
      await addEmployee(values, form, onCancel);
    } catch (error) {
      console.log("error in add employee: ", error);
    }
  };

  return (
    <Modal
      title="Add Employee"
      open={isVisible}
      onCancel={() => {
        form.resetFields(); // Reset the form fields when the modal is closed
        onCancel();
      }}
      footer={[
        <Button
          key="back"
          onClick={() => {
            form.resetFields(); // Reset the form fields when canceling
            onCancel();
          }}
        >Cancel</Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSave}
          disabled={!isFormValid}
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
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please input the email!",
            },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input the password!" }]}
        >
          <Input.Password />
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

export default AddEmployeeModal;

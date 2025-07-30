import React from "react";
import { Modal } from "antd";

const DeleteEmployeeModal = ({ isVisible, onCancel, onDelete, employeeId }) => {
  return (
    <Modal
      title="Are you sure you want to delete this employee?"
      open={isVisible}
      onOk={() => onDelete(employeeId)}
      onCancel={onCancel}
      okText="Yes"
      okType="danger"
      cancelText="No"
    >
      <p>This action cannot be undone.</p>
    </Modal>
  );
};

export default DeleteEmployeeModal;

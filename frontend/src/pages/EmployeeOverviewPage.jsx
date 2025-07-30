import React, { useEffect, useState, useCallback } from "react";
import { useGlobalContext } from "../context/globalContext";
import styled from "styled-components";
import GlobalLayout from "../styles/GlobalLayout";
import Button from "../components/Button";
import { Pagination, Dropdown } from "antd";
import {
  EllipsisOutlined,
  UserAddOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import UpdateEmployeeModal from "./Admin/UpdateEmployeeModal";
import AddEmployeeModal from "./Admin/AddEmployeeModal";
import DeleteEmployeeModal from "./Admin/DeleteEmployeeModal";

// Debounce Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const EmployeeOverviewPage = () => {
  const {
    getAllEmployees,
    allEmployees,
    totalEmployees,
    currentPage,
    setCurrentPage,
    pageSize,
    exportAllEmployeesToCSV,
    exportFilteredEmployeesToCSV,
    fetchRoles,
    roles,
    searchTerm,
    setSearchTerm,
    selectedRoles,
    setSelectedRoles,
    deleteEmployee,
  } = useGlobalContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] =
    useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Dies simuliert eine Suche, die auf den debounced Wert reagiert
  const performSearch = useCallback(
    (term) => {
      console.log("Suche nach:", term);
      setCurrentPage(1);
      getAllEmployees(1, pageSize); // Stelle sicher, dass getAllEmployees hier die aktuellen Werte verwendet
    },
    [getAllEmployees, pageSize, setCurrentPage]
  );

  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handlePageChange = (page, pageSize) => {
    getAllEmployees(page, pageSize);
  };

  const handleRoleClick = (role) => {
    setSelectedRoles((prevSelectedRoles) => {
      if (prevSelectedRoles.includes(role)) {
        return prevSelectedRoles.filter((r) => r !== role);
      } else {
        return [...prevSelectedRoles, role];
      }
    });
  };

  const showModal = (employee) => {
    setCurrentEmployee(employee);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentEmployee(null);
  };

  const handleMenuClick = (e) => {
    if (e.key === "add") {
      setIsAddEmployeeModalVisible(true);
    } else if (e.key === "export") {
      exportAllEmployeesToCSV();
    } else if (e.key === "exportFiltered") {
      exportFilteredEmployeesToCSV();
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    setCurrentPage(1);
    getAllEmployees(1, pageSize);
  }, [debouncedSearchTerm, selectedRoles, pageSize, setCurrentPage]);

  const items = [
    { key: "add", icon: <UserAddOutlined />, label: "Add employee" },
    { key: "export", icon: <ExportOutlined />, label: "Export all emp" },
    {
      key: "exportFiltered",
      icon: <ExportOutlined />,
      label: "Export filtered emp",
    },
  ];

  const handleDelete = (employeeId) => {
    setEmployeeToDelete(employeeId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = (employeeId) => {
    deleteEmployee(employeeId);
    setIsDeleteModalVisible(false);
    setEmployeeToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setEmployeeToDelete(null);
  };

  return (
    <GlobalLayout>
      <EmployeeOverviewStyle>
        <div className="sticky-header">
          <h2>Employee Overview</h2>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <StyledDropdownButton>
              <EllipsisOutlined />
            </StyledDropdownButton>
          </Dropdown>
          <StyledInput
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="role-buttons">
            {roles.map((role) => (
              <Button
                key={role}
                bg={selectedRoles.includes(role) ? "#2db4a0" : "#e0e0e0"}
                padding="10px 20px"
                borderradius="5px"
                color={selectedRoles.includes(role) ? "#ffffff" : "#000000"}
                hoverBg={selectedRoles.includes(role) ? "#009782" : "#c3c3c3"}
                disabledColor="#c3eddf"
                name={role}
                onClick={() => handleRoleClick(role)}
              />
            ))}
          </div>
        </div>
        <div className="employee-list-container">
          <div className="employee-list">
            {allEmployees.map((employee) => (
              <div key={employee._id} className="employee-item">
                <div className="employee-details">
                  <p className="employee-name">
                    {employee.firstname} {employee.lastname}
                  </p>
                  <p className="employee-role">{employee.role}</p>
                </div>
                <EditButton onClick={() => showModal(employee)}>
                  <EditOutlined />
                </EditButton>
                <DeleteButton onClick={() => handleDelete(employee._id)}>
                  <DeleteOutlined />
                </DeleteButton>
              </div>
            ))}
          </div>
        </div>
        <div className="pagination-container">
          <Pagination
            className="pagination"
            current={currentPage}
            total={totalEmployees}
            pageSize={pageSize}
            onChange={handlePageChange}
          />
        </div>
      </EmployeeOverviewStyle>
      <AddEmployeeModal
        isVisible={isAddEmployeeModalVisible}
        onCancel={() => setIsAddEmployeeModalVisible(false)}
        roles={roles}
      />
      <UpdateEmployeeModal
        isVisible={isModalVisible}
        onCancel={handleCancel}
        employee={currentEmployee}
        roles={roles}
      />
      <DeleteEmployeeModal
        isVisible={isDeleteModalVisible}
        onCancel={handleCancelDelete}
        onDelete={handleConfirmDelete}
        employeeId={employeeToDelete}
      />
    </GlobalLayout>
  );
};

const EmployeeOverviewStyle = styled.div`
  .sticky-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    margin-bottom: 20px;
  }

  .role-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .employee-list-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 340px;
    overflow-y: auto;
    width: 100%;
    box-sizing: border-box;
  }

  @media (min-height: 821px) {
    .employee-list-container {
      max-height: 500px;
    }
  }

  @media (min-height: 1300px) {
    .employee-list-container {
      max-height: 700px;
    }
  }

  .employee-list {
    width: 100%;
    box-sizing: border-box;
  }

  .employee-item {
    padding: 10px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
  }

  .employee-details {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .employee-name {
    width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .employee-role {
    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    width: 100%;
  }

  /* Media query for screens smaller than 768px */
  @media (max-width: 768px) {
    max-width: 90%;
    .employee-name {
      width: 120px;
      font-size: 16px;
    }

    .employee-role {
      width: 70px;
      font-size: 16px;
    }

    .sticky-header h2 {
      font-size: 18px;
    }

    .role-buttons {
      flex-direction: column;
      gap: 5px;
    }

    .pagination-container {
      margin-top: 10px;
    }
  }
`;

const StyledInput = styled.input`
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 5px;
  width: 80%;
  max-width: 500px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #2db4a0;
  }

  &:hover {
    border-color: #2db4a0;
  }
`;

const StyledDropdownButton = styled.div`
  font-size: 24px;
  cursor: pointer;
`;

const EditButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  transition: color 0.3s ease;
  color: #d9ddde;

  &:hover {
    background-color: #f0f0f0;
    color: #616363;
  }

  & > .anticon {
    font-size: 24px;
  }
`;

const DeleteButton = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  transition: color 0.3s ease;
  color: #fa4d4d;

  &:hover {
    color: #ff0000;
    background-color: #f0f0f0;
  }

  & > .anticon {
    font-size: 24px;
  }
`;

export default EmployeeOverviewPage;

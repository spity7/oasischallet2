import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import useShowModal from "../hooks/useShowModal";
import userAtom from "../atoms/userAtom";
import { useSetRecoilState } from "recoil";

axios.defaults.withCredentials = true;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const showModal = useShowModal();
  const setUser = useSetRecoilState(userAtom);
  const [allEmployees, setAllEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);

  const handleSignup = async (
    firstname,
    lastname,
    username,
    email,
    password,
    role
  ) => {
    try {
      const res = await axios.post(`${BASE_URL}signup`, {
        firstname,
        lastname,
        username,
        email,
        password,
        role,
      });

      const data = await res.data;

      if (data.error) {
        showModal("Error", data.error, "error");
        return;
      }

      // Store a message or status in localStorage to show to the user
      localStorage.setItem(
        "signup-status",
        JSON.stringify({
          message:
            "Signup successful! Please check your email to verify your account.",
        })
      );

      window.location.href = "/verify-email";
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showModal("Error", error.response.data.error, "error");
      } else {
        showModal("Error", "An error occurred. Please try again.", "error");
      }
    }
  };

  const handleLogin = async (emailOrUsername, password) => {
    try {
      const res = await axios.post(`${BASE_URL}login`, {
        emailOrUsername,
        password,
      });

      const data = res.data;

      if (res.status === 200) {
        if (!data.isVerified) {
          showModal(
            "Error",
            "Please verify your email before logging in.",
            "error"
          );
          return;
        }

        if (localStorage.getItem("signup-status")) {
          localStorage.removeItem("signup-status");
        }

        localStorage.setItem("user-app", JSON.stringify(data));
        setUser(data);
      } else {
        showModal("Error", data.error || "Unknown error occurred", "error");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          showModal("Error", "Unauthorized. Please log in again.", "error");
        } else if (status === 400) {
          showModal("Error", error.response.data.error, "error");
        } else {
          showModal("Error", `HTTP Error ${status}`, "error");
        }
      } else if (error.request) {
        showModal("Error", "No response from server", "error");
      } else {
        showModal("Error", "An error occurred. Please try again.", "error");
      }
      console.error("Login error:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${BASE_URL}logout`);
      const data = res.data;

      if (data.error) {
        showModal("Error", data.error, "error");
        return;
      }

      localStorage.removeItem("user-app");
      setUser(null);
    } catch (error) {
      console.error("Error while logging out:", error.message);
      showModal("Error", error.message, "error");
    }
  };

  const getAllEmployees = useCallback(
    async (page = 1, limit = 10) => {
      try {
        const response = await axios.get(`${BASE_URL}get-all-employees`, {
          params: { search: searchTerm, roles: selectedRoles, page, limit },
        });
        setAllEmployees(response.data.employees);
        setTotalEmployees(response.data.total);
        setCurrentPage(response.data.page);
        setPageSize(response.data.limit);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    },
    [searchTerm, selectedRoles]
  );

  const exportAllEmployeesToCSV = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}export-all-employees-to-csv`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "employees.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting employees:", error);
    }
  };

  const exportFilteredEmployeesToCSV = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}export-filtered-employees-to-csv`,
        {
          params: { search: searchTerm, roles: selectedRoles },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filtered_employees.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting filtered employees:", error);
    }
  };

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}roles`);
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, []);

  const addEmployee = async (employeeData, form, onCancel) => {
    try {
      const response = await axios.post(`${BASE_URL}signup`, employeeData);

      if (response.status === 201) {
        showModal(
          "Success",
          "User created successfully! Please check the email to verify.",
          "success"
        );
        onCancel();
        form.resetFields();
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showModal("Error", error.response.data.error, "error");
      } else {
        showModal("Error", "An error occurred. Please try again.", "error");
      }
    }
  };

  const handleUpdateEmployee = async (id, values) => {
    try {
      const response = await axios.put(
        `${BASE_URL}update-employee/${id}`,
        values
      );
      getAllEmployees(currentPage, pageSize);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}delete-employee/${id}`);

      if (response.status === 200) {
        // Refresh the employee list after deletion
        getAllEmployees(currentPage, pageSize);
        showModal("Success", "Employee deleted successfully", "success");
      }
    } catch (error) {
      showModal("Error", "Failed to delete employee", "error");
    }
  };

  const fetchUserById = useCallback(async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}user/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }, []);

  const handleUpdateProfile = async (id, userData) => {
    try {
      const response = await axios.put(`${BASE_URL}user/${id}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const addTermin = useCallback(async (terminData) => {
    try {
      const response = await axios.post(`${BASE_URL}add-termin`, terminData);
      console.log("تمت إضافة الحجز بنجاح:", response.data);
      // Erfolgreiche Antwort
      return response.data; // Dies gibt die Daten zurück, die im handleSubmit benötigt werden
    } catch (error) {
      console.error("خطأ في إضافة الحجز:", error);
      // Die Fehlerbehandlung
      throw error; // Fehler an den handleSubmit weitergeben
    }
  }, []);

  const getTermins = async (start, end) => {
    try {
      const response = await axios.get(`${BASE_URL}get-termins`, {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      const events = response.data.termins
        .filter((termin) => new Date(termin.endDate) >= new Date())
        .map((termin) => ({
          id: termin._id,
          title: termin.name,
          guestCount: termin.guestCount,
          price: termin.price,
          downPayment: termin.downPayment,
          start: new Date(termin.startDate),
          end: new Date(termin.endDate),
          allDay: false,
        }));

      return events;
    } catch (error) {
      console.error("حدث خطأ أثناء جلب الأحداث:", error.message);
      throw error; // Re-throw the error to handle it in the component
    }
  };

  const updateTermin = async (id, updatedTermin) => {
    try {
      console.log("Sending data to update:", updatedTermin); // Debugging Log

      const response = await axios.put(
        `${BASE_URL}update-termin/${id}`,
        updatedTermin
      );

      if (response.status === 200) {
        console.log("Termin updated successfully");
        showModal(
          "Success",
          "لقد تم تحديث معلومات الحجز الخاصة بك بنجاح.",
          "success"
        );
        return response.data;
      } else {
        throw new Error("فشل تحديث الحجز");
      }
    } catch (error) {
      console.error(
        "حدث خطأ أثناء تحديث الحجز:",
        error.response?.data || error.message
      );
      throw error; // Re-throw the error to handle it in the component
    }
  };

  const deleteTermin = async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}delete-termin/${id}`);

      if (response.status === 200) {
        showModal("Success", "لقد تم حذف حجزك بنجاح.", "success");
        return response.data;
      } else {
        throw new Error("فشل في حذف الحجز");
      }
    } catch (error) {
      showModal(
        "Error",
        error.response?.data?.error || "حدث خطأ غير متوقع",
        "error"
      );
      throw error;
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        handleSignup,
        handleLogin,
        handleLogout,
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
        addEmployee,
        handleUpdateEmployee,
        deleteEmployee,
        fetchUserById,
        handleUpdateProfile,
        addTermin,
        getTermins,
        updateTermin,
        deleteTermin,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

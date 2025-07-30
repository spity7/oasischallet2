import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import GlobalLayout from "../../styles/GlobalLayout";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGlobalContext } from "../../context/globalContext"; // Import useGlobalContext
import useShowModal from "../../hooks/useShowModal"; // Import useShowModal
import { Button as AntButton } from "antd";

const NewBookingPage = () => {
  const { addTermin } = useGlobalContext(); // Destructure addTermin from context
  const showModal = useShowModal(); // Use the showModal hook

  const location = useLocation();

  // Hilfsfunktion um Query-Parameter auszulesen
  const getQueryParams = () => {
    return new URLSearchParams(location.search);
  };

  // Initiale Daten vorbereiten
  useEffect(() => {
    const params = getQueryParams();
    const startParam = params.get("start");

    if (startParam) {
      const startDate = new Date(startParam);

      setFormData((prev) => ({
        ...prev,
        startDate,
      }));
    }
  }, [location.search]);

  const [formData, setFormData] = useState({
    name: "",
    guestCount: "",
    price: "",
    downPayment: "",
    startDate: setDefaultDate(new Date(), 19, 0), // Default to today at 19:00
    endDate: null, // No default value for endDate
  });

  const [hasTouchedStartDate, setHasTouchedStartDate] = useState(false);
  const [hasTouchedEndDate, setHasTouchedEndDate] = useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [dateError, setDateError] = useState(""); // State to hold date error message

  function handleChange(event) {
    const { name, value } = event.target;

    // Ensure the input is a positive number
    if (name === "guestCount" || name === "price" || name === "downPayment") {
      const numericValue = Number(value);
      if (isNaN(numericValue) || numericValue < 0) {
        return; // Do not update state if the value is not a valid positive number
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

  function handleDateChange(date, field) {
    if (date) {
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
    }

    setFormData((prev) => ({ ...prev, [field]: date }));

    if (field === "startDate") setHasTouchedStartDate(true);
    if (field === "endDate") setHasTouchedEndDate(true);

    // Aktuelle Werte vorbereiten
    const newStart = field === "startDate" ? date : formData.startDate;
    const newEnd = field === "endDate" ? date : formData.endDate;

    // Neue Validierung basierend auf aktuellen Werten
    if (newStart && newEnd) {
      if (newEnd <= newStart) {
        setDateError("يجب أن يكون تاريخ النهاية بعد تاريخ البداية!");
      } else {
        setDateError(""); // ❗️Fehler zurücksetzen, wenn gültig
      }
    } else {
      setDateError(""); // Reset wenn unvollständig
    }
  }

  function setDefaultDate(date, hours, minutes) {
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  }

  const isFormValid = useCallback(() => {
    const { name, guestCount, price, downPayment, startDate, endDate } =
      formData;
    return (
      name &&
      guestCount &&
      price &&
      downPayment &&
      startDate &&
      endDate &&
      endDate > startDate &&
      hasTouchedStartDate && // Datumfelder müssen aktiv ausgewählt sein
      hasTouchedEndDate
    );
  }, [formData, hasTouchedStartDate, hasTouchedEndDate]);

  useEffect(() => {
    setIsButtonDisabled(!isFormValid());
  }, [formData, isFormValid]);

  const handleSubmit = async () => {
    const { price, guestCount, downPayment } = formData;

    if (Number(guestCount) <= 0) {
      showModal("Error", "يجب أن يكون عدد الضيوف أكبر من 0.", "error");
      return;
    }

    if (Number(price) <= 0) {
      showModal("Error", "يجب أن يكون السعر أكبر من 0.", "error");
      return;
    }

    if (Number(price) < Number(downPayment)) {
      showModal(
        "Error",
        "وينبغي أن يكون السعر على الأقل بقدر الدفعة الأولى.",
        "error"
      );
      return;
    }

    if (Number(price) < 100) {
      const modal = showModal(
        "Warning",
        "السعر أقل من $100. هل أنت متأكد أنك تريد الاستمرار؟",
        "warning",
        [
          <NoButton key="no" onClick={() => modal.destroy()}>
            No
          </NoButton>,
          <WarningButton
            key="yes"
            onClick={async () => {
              modal.destroy(); // Ensure the modal closes regardless of what happens
              try {
                await addTermin(formData);

                setFormData({
                  name: "",
                  guestCount: "",
                  price: "",
                  downPayment: "",
                  startDate: setDefaultDate(new Date(), 19, 0),
                  endDate: null,
                });

                showModal("Success", "لقد تم تقديم الحجز الخاص بك بنجاح.");
              } catch (error) {
                console.error("خطأ في إرسال النموذج:", error);

                const errorMessage =
                  error.response &&
                  error.response.data &&
                  error.response.data.error
                    ? error.response.data.error
                    : "حدث خطأ أثناء تقديم الحجز الخاص بك. حاول ثانية.";

                showModal("Error", errorMessage, "error");
              }
            }}
          >
            Yes
          </WarningButton>,
        ],
        null, // Set `persistent` to true so it doesn't auto-close
        true // Make the modal persistent
      );
    } else {
      try {
        await addTermin(formData);

        // Reset the form after successful submission
        setFormData({
          name: "",
          guestCount: "",
          price: "",
          downPayment: "",
          startDate: setDefaultDate(new Date(), 19, 0),
          endDate: null,
        });

        // Show a success message that closes after 2.5 seconds
        showModal("Success", "لقد تم تقديم الحجز الخاص بك بنجاح.");
      } catch (error) {
        console.error("Error submitting form:", error);

        // Determine the error message based on the error response
        const errorMessage =
          error.response && error.response.data && error.response.data.error
            ? error.response.data.error
            : "حدث خطأ أثناء تقديم الحجز الخاص بك. حاول ثانية.";

        // Show an error message that closes after 2.5 seconds
        showModal("Error", errorMessage, "error");
      }
    }
  };

  return (
    <GlobalLayout>
      <h2>حجز جديد</h2>
      <FormWrapper>
        <FormGroup>
          <Label htmlFor="name">اسم</Label>
          <Input
            type="text"
            placeholder="أدخل الاسم"
            onChange={handleChange}
            name="name"
            id="name"
            value={formData.name}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="guestCount">عدد الضيوف</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="أدخل عدد الضيوف"
            min={0}
            onChange={handleChange}
            name="guestCount"
            id="guestCount"
            value={formData.guestCount}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="price">السعر [$]</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="أدخل السعر"
            min={0}
            onChange={handleChange}
            name="price"
            id="price"
            value={formData.price}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="downPayment">الدفعة الأولى [$]</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="أدخل الدفعة الأولى"
            min={0}
            onChange={handleChange}
            name="downPayment"
            id="downPayment"
            value={formData.downPayment}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="startDate">تاريخ البدء</Label>
          <StyledDatePickerWrapper>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => handleDateChange(date, "startDate")}
              id="startDate"
              name="startDate"
              showTimeSelect
              timeIntervals={60}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              wrapperClassName="datepicker-wrapper"
            />
          </StyledDatePickerWrapper>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
          <StyledDatePickerWrapper>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => handleDateChange(date, "endDate")}
              id="endDate"
              name="endDate"
              showTimeSelect
              timeIntervals={60}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              wrapperClassName="datepicker-wrapper"
            />
          </StyledDatePickerWrapper>
          {dateError && <ErrorText>{dateError}</ErrorText>}{" "}
          {/* Display error message */}
        </FormGroup>
        <ButtonWrapper>
          <Button
            type="button"
            disabled={isButtonDisabled}
            onClick={handleSubmit} // Call handleSubmit on button click
          >
            يُقدِّم
          </Button>
        </ButtonWrapper>
      </FormWrapper>
    </GlobalLayout>
  );
};

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 600px) {
    padding: 10px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 18px;
  color: #009782;
`;

const Input = styled.input`
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  text-align: center;
  margin-bottom: 5px;
  transition: border-color 0.3s;
  width: 100%;

  &:focus {
    border-color: #009782;
    outline: none;
  }

  &:hover {
    border-color: #009782;
  }

  &.number-input {
    padding-left: 30px;
    padding-right: 30px;
  }
`;

const StyledDatePickerWrapper = styled.div`
  .react-datepicker__input-container {
    width: 100%;
  }

  .react-datepicker__time-container {
    border-left: 2px solid #ccc;
  }

  .react-datepicker__input-container input {
    border: 2px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    font-size: 16px;
    text-align: center;
    margin-bottom: 5px;
    transition: border-color 0.3s;
    width: 100%;

    &:focus {
      border-color: #009782;
      outline: none;
    }

    &:hover {
      border-color: #009782;
    }
  }

  @media (max-width: 600px) {
    .react-datepicker__input-container input {
      font-size: 14px;
    }
  }
`;

const Button = styled.button`
  background-color: #2db4a0;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.3s;
  max-width: 100%;
  width: 150px;
  margin-top: 5px;

  &:disabled {
    background-color: #c3eddf;
    cursor: not-allowed;
  }

  &:hover {
    background-color: #009782;
  }
`;

// Wrapper to center the button
const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const WarningButton = styled(AntButton)`
  border: none;
  background-color: #1890ff;
  color: white;
  padding: 8px 16px;
  margin: 0 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
`;

export const NoButton = styled(AntButton)``;

// Add styled components for error text
const ErrorText = styled.div`
  color: red;
  margin-top: 8px;
  font-size: 14px;
`;

export default NewBookingPage;

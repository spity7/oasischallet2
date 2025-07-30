import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GlobalLayout from "../../styles/GlobalLayout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";
import { useGlobalContext } from "../../context/globalContext";
import { Modal, Form, Input, Button } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useShowModal from "../../hooks/useShowModal";
import "moment/locale/ar";

import CustomToolbar from "../../components/CustomToolbar";
import FreeSlotsGroupedList from "../../components/FreeSlotsGroupedList";
import BookingsList from "../../components/BookingsList";

import {
  formatLebanese,
  lebaneseMonths,
  toArabicNumber,
  getArabicWeekday,
  formatTimeArabic,
} from "../../utils/dateFormats";

moment.locale("ar");
const localizer = momentLocalizer(moment);

const generateFreeSlotsWhatsAppMessage = (freeSlots) => {
  if (!freeSlots || freeSlots.length === 0) {
    return "لا توجد فترات حرة متاحة حالياً.";
  }

  let message = "هذه هي الفترات الحرة المتاحة:\n\n";

  freeSlots.forEach((slot, index) => {
    // Start um 2 Stunden später
    const start = new Date(new Date(slot.start).getTime() + 2 * 60 * 60 * 1000);
    // Ende um 2 Stunden früher
    const end = new Date(new Date(slot.end).getTime() - 2 * 60 * 60 * 1000);

    const startText = `${getArabicWeekday(start)} ${toArabicNumber(
      start.getDate().toString()
    )} ${lebaneseMonths[start.getMonth()]} ${formatTimeArabic(start)}`;

    const endText = `${getArabicWeekday(end)} ${toArabicNumber(
      end.getDate().toString()
    )} ${lebaneseMonths[end.getMonth()]} ${formatTimeArabic(end)}`;

    message += `${index + 1}. من ${startText} إلى ${endText}\n`;
  });

  message +=
    "\nإذا كنت مهتمًا بأي من هذه الفترات، يرجى التواصل معنا لتأكيد الحجز.";

  return message;
};

const generateFreeSlotsWhatsAppLink = (freeSlots) => {
  const message = generateFreeSlotsWhatsAppMessage(freeSlots);
  const encodedMessage = encodeURIComponent(message);
  console.log(message);
  return `https://wa.me/?text=${encodedMessage}`;
};

export const generateWhatsAppLink = (event) => {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const startText = `${getArabicWeekday(startDate)} ${toArabicNumber(
    startDate.getDate().toString()
  )} ${lebaneseMonths[startDate.getMonth()]} ${formatTimeArabic(startDate)}`;
  const endText = `${getArabicWeekday(endDate)} ${toArabicNumber(
    endDate.getDate().toString()
  )} ${lebaneseMonths[endDate.getMonth()]} ${formatTimeArabic(endDate)}`;

  const message = `حجز من ${startText} لغاية ${endText}. إذا الموعد مناسب إلك، لو سمحت أكّدلي`;
  const encodedMessage = encodeURIComponent(message);

  console.log(message);

  return `https://wa.me/?text=${encodedMessage}`;
};

const CalendarPage = () => {
  const showModal = useShowModal();
  const { getTermins, updateTermin, deleteTermin } = useGlobalContext();
  const [events, setEvents] = useState([]);
  const cache = useRef(new Map());
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFreeSlotsModalVisible, setIsFreeSlotsModalVisible] = useState(false);
  const [isBookingsModalVisible, setIsBookingsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allFreeSlots, setAllFreeSlots] = useState([]);
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [currentRange, setCurrentRange] = useState({
    start: new Date(),
    end: moment().add(1, "month").toDate(),
  });
  const navigate = useNavigate();

  // Funktion für Klick auf freien Slot:
  const handleFreeSlotClick = (slot) => {
    // Slot-Start und -Ende als ISO-String für URL
    const startISO = slot.start.toISOString();
    const endISO = slot.end.toISOString();

    // Navigieren zur Buchungsseite mit Query-Parametern
    navigate(
      `/admin/new-booking?start=${encodeURIComponent(
        startISO
      )}&end=${encodeURIComponent(endISO)}`
    );

    // Modal schließen
    setIsFreeSlotsModalVisible(false);
  };

  const fetchEvents = useCallback(
    async (start, end) => {
      const key = `${start.toISOString()}-${end.toISOString()}`;

      if (cache.current.has(key)) {
        console.log(`🔁 Cache HIT for range: ${key}`);
        setEvents(cache.current.get(key));
        return;
      }

      console.log(`🌐 Cache MISS – fetching from server: ${key}`);
      setLoading(true);
      const startTime = Date.now();

      try {
        const events = await getTermins(start, end);
        const sorted = [...events].sort(
          (a, b) => new Date(a.start) - new Date(b.start)
        );
        const freeSlots = [];
        const minDurationHours = 2;
        const now = new Date();

        if (sorted.length > 0) {
          const firstStart = new Date(sorted[0].start);

          // Slot vor der ersten Buchung
          const preGapStart = start < now ? now : start;
          const preGapHours = (firstStart - preGapStart) / (1000 * 60 * 60);
          if (preGapHours > minDurationHours) {
            freeSlots.push({
              id: `free-pre-${key}`,
              title: `${formatLebanese(preGapStart)} – ${formatLebanese(
                firstStart
              )}`,
              start: preGapStart,
              end: new Date(firstStart),
              isFreeSlot: true,
            });
          }

          // Zwischen-Buchungen
          let last = new Date(sorted[0].end);
          for (let i = 1; i < sorted.length; i++) {
            const currStart = new Date(sorted[i].start);
            const gapStart = last < now ? now : last;
            const gapHours = (currStart - gapStart) / (1000 * 60 * 60);

            if (gapHours > minDurationHours) {
              freeSlots.push({
                id: `free-${i}-${key}`,
                title: `${formatLebanese(gapStart)} – ${formatLebanese(
                  currStart
                )}`,
                start: gapStart,
                end: new Date(currStart),
                isFreeSlot: true,
              });
            }

            last = new Date(Math.max(last, new Date(sorted[i].end)));
          }

          // Slot nach der letzten Buchung
          const postGapStart = last < now ? now : last;
          const postGapHours = (end - postGapStart) / (1000 * 60 * 60);
          if (postGapHours > minDurationHours) {
            freeSlots.push({
              id: `free-post-${key}`,
              title: `${formatLebanese(postGapStart)} – ${formatLebanese(end)}`,
              start: postGapStart,
              end: new Date(end),
              isFreeSlot: true,
            });
          }

          console.log("🟩 Freie Zeiträume (ab jetzt):");
          freeSlots.forEach((slot, index) => {
            console.log(
              `Slot ${index + 1}: ${moment(slot.start).format(
                "YYYY-MM-DD HH:mm"
              )} bis ${moment(slot.end).format("YYYY-MM-DD HH:mm")}`
            );
          });
        } else {
          // Ganz frei
          const freeStart = start < now ? now : start;
          const fullGapHours = (end - freeStart) / (1000 * 60 * 60);
          if (fullGapHours > minDurationHours) {
            freeSlots.push({
              id: `free-full-${key}`,
              title: `${formatLebanese(freeStart)} – ${formatLebanese(end)}`,
              start: freeStart,
              end: new Date(end),
              isFreeSlot: true,
            });
          }
          console.log("🟩 Alle Zeit ist frei (keine Buchungen vorhanden).");
        }

        const combined = [...events, ...freeSlots];
        cache.current.set(key, combined);
        setEvents(combined);

        updateAllFreeSlotsFromCache();

        const elapsed = Date.now() - startTime;
        const delay = Math.max(500 - elapsed, 0);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    },
    [getTermins]
  );

  // Nur das Range setzen, kein fetch hier!
  const handleRangeChange = ({ start, end }) => {
    console.log(`handleRangeChange wurde getriggert`);
    const startDate = moment(start).startOf("day").toDate();
    const endDate = moment(end).endOf("day").toDate();
    setCurrentRange({ start: startDate, end: endDate });
    console.log(`New Range: ${startDate} - ${endDate}`);
  };

  // Debounced fetch im useEffect beim Ändern von currentRange
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEvents(currentRange.start, currentRange.end);
    }, 300);

    return () => clearTimeout(handler);
  }, [currentRange, fetchEvents]);

  // Rest unverändert:
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setStartDate(new Date(event.start));
    setEndDate(new Date(event.end));
    form.setFieldsValue({
      name: event.title,
      guestCount: event.guestCount,
      price: event.price,
      downPayment: event.downPayment,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedEvent = {
        ...selectedEvent,
        name: values.name,
        guestCount: Number(values.guestCount),
        price: Number(values.price),
        downPayment: values.downPayment,
        startDate: startDate,
        endDate: endDate,
      };

      if (!selectedEvent.id) {
        throw new Error("Event ID is missing");
      }

      await updateTermin(selectedEvent.id, updatedEvent);
      cache.current.clear();

      fetchEvents(currentRange.start, currentRange.end);

      setIsModalVisible(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
      showModal(
        "Error",
        error.response?.data?.error || "An unexpected error occurred",
        "error"
      );
    }
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedEvent && selectedEvent.id) {
        await deleteTermin(selectedEvent.id);
        cache.current.clear();
        fetchEvents(currentRange.start, currentRange.end);
        setIsDeleteModalVisible(false);
        setIsModalVisible(false);
        setSelectedEvent(null);
        showModal("Success", "لقد تم حذف حجزك بنجاح.", "success");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      showModal(
        "Error",
        error.response?.data?.error || "An unexpected error occurred",
        "error"
      );
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
  };

  const handleNavigate = (date, view, action) => {
    console.log(
      `📆 Navigiert zu: ${moment(date).format(
        "YYYY-MM-DD"
      )} | View: ${view} | Action: ${action}`
    );
    setDisplayDate(date);

    const startDate = moment(date).startOf("month").toDate();
    const endDate = moment(date).endOf("month").toDate();
    console.log(
      `➡️ Neuer Range gesetzt: ${startDate.toISOString()} - ${endDate.toISOString()}`
    );
    setCurrentRange({ start: startDate, end: endDate });
  };

  function mergeOverlappingSlots(slots) {
    if (!slots.length) return [];

    // Sortieren nach Startzeit
    const sorted = slots
      .slice()
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    const merged = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      const current = sorted[i];

      const lastEnd = new Date(last.end);
      const currentStart = new Date(current.start);
      const currentEnd = new Date(current.end);

      // Wenn Slots sich überschneiden oder direkt aneinander liegen
      if (currentStart <= lastEnd) {
        // Erweiterung des Endes, falls aktueller Slot später endet
        if (currentEnd > lastEnd) {
          last.end = current.end;
        }
        // Sonst bleiben sie unverändert, da Slot schon abgedeckt ist
      } else {
        // Kein Überschneidung, neuen Slot anhängen
        merged.push(current);
      }
    }

    return merged;
  }

  function updateAllFreeSlotsFromCache() {
    let allEvents = [];
    cache.current.forEach((eventsArray) => {
      allEvents = allEvents.concat(eventsArray);
    });
    const freeSlots = allEvents.filter((e) => e.isFreeSlot);
    freeSlots.sort((a, b) => new Date(a.start) - new Date(b.start));

    const mergedSlots = mergeOverlappingSlots(freeSlots);
    setAllFreeSlots(mergedSlots);
  }

  return (
    <GlobalLayout>
      <h2 style={{ textAlign: "center" }}>تقويم</h2>
      <h3 style={{ textAlign: "center" }}>
        {lebaneseMonths[moment(displayDate).month()]}{" "}
        {toArabicNumber(moment(displayDate).year().toString())}
      </h3>
      <ButtonContainer>
        <HeaderButtons>
          <Button
            type="primary"
            onClick={() => setIsFreeSlotsModalVisible(true)}
            style={{
              marginTop: "-50px",
              marginBottom: "5px",
              width: "100px",
              backgroundColor: "#67db81",
            }}
          >
            فراغات
          </Button>
          <Button
            type="primary"
            onClick={() => setIsBookingsModalVisible(true)}
            style={{ marginTop: "0px", width: "100px" }} // Abstand zum oberen Button
          >
            الحجوزات
          </Button>
        </HeaderButtons>
      </ButtonContainer>
      <StyledCalendarWrapper>
        {loading && (
          <Overlay>
            <Skeleton height={600} />
          </Overlay>
        )}
        <Calendar
          localizer={localizer}
          components={{ toolbar: CustomToolbar }}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onNavigate={handleNavigate}
          onRangeChange={handleRangeChange}
          onSelectEvent={(event) => {
            if (event.isFreeSlot) return; // freie Slots nicht klickbar machen
            handleEventClick(event);
          }}
          eventPropGetter={(event) => {
            if (event.isFreeSlot) {
              return {
                style: {
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  border: "1px dashed #155724",
                  opacity: 0.9,
                },
              };
            }
            return {
              style: {
                backgroundColor: "#007bff",
                color: "white",
              },
            };
          }}
          style={{
            height: "calc(100vh - 160px)",
          }}
        />
        <Modal
          title="الفترات الحرة"
          open={isFreeSlotsModalVisible}
          onCancel={() => setIsFreeSlotsModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsFreeSlotsModalVisible(false)}
            >
              إغلاق
            </Button>,
          ]}
          width={600}
        >
          {/* WhatsApp Export Button oben, nur wenn es Slots in der aktuellen Ansicht gibt */}
          {allFreeSlots.length > 0 && (
            <div style={{ marginBottom: "15px", textAlign: "center" }}>
              <a
                href={generateFreeSlotsWhatsAppLink(allFreeSlots)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#25D366",
                    marginBottom: "10px",
                    width: "100%",
                  }}
                >
                  WhatsApp إرسال قائمة الفترات الحرة عبر
                </Button>
              </a>
            </div>
          )}
          {/* Freie Slots aus dem kompletten Cache */}
          <FreeSlotsList>
            {allFreeSlots.length === 0 ? (
              <p>لا توجد فترات حرة حالياً.</p>
            ) : (
              <FreeSlotsGroupedList
                slots={allFreeSlots}
                onClick={handleFreeSlotClick}
              />
            )}
          </FreeSlotsList>
        </Modal>
        <Modal
          title="الحجوزات"
          open={isBookingsModalVisible}
          onCancel={() => setIsBookingsModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setIsBookingsModalVisible(false)}
            >
              إغلاق
            </Button>,
          ]}
          width={600}
        >
          <FreeSlotsList>
            {events.filter((e) => !e.isFreeSlot).length === 0 && (
              <p>لا توجد حجوزات حالياً.</p>
            )}
            <BookingsList
              bookings={events.filter((e) => !e.isFreeSlot)}
              onClick={(booking) => {
                setSelectedEvent(booking);
                setStartDate(new Date(booking.start));
                setEndDate(new Date(booking.end));
                form.setFieldsValue({
                  name: booking.title,
                  guestCount: booking.guestCount,
                  price: booking.price,
                  downPayment: booking.downPayment,
                });
                setIsBookingsModalVisible(false);
                setIsModalVisible(true); // Öffne das bearbeitbare Modal
              }}
            />
          </FreeSlotsList>
        </Modal>

        <StyledModalWrapper>
          <Modal
            title="تفاصيل الحجز"
            className="custom-modal"
            open={isModalVisible}
            onCancel={handleCancel}
            style={{ top: 0 }}
            footer={
              <FooterWrapper>
                <Button key="delete" danger onClick={handleDelete}>
                  يمسح
                </Button>
                <div className="rightAlignedButtons">
                  <Button key="back" onClick={handleCancel}>
                    يلغي
                  </Button>
                  <Button key="submit" type="primary" onClick={handleOk}>
                    يحفظ
                  </Button>
                </div>
              </FooterWrapper>
            }
          >
            {selectedEvent && (
              <Form layout="vertical" form={form}>
                <Form.Item label="اسم" name="name">
                  <Input />
                </Form.Item>
                <Form.Item label="عدد الضيوف" name="guestCount">
                  <Input type="number" />
                </Form.Item>
                <Form.Item label="السعر [$]" name="price">
                  <Input type="number" />
                </Form.Item>
                <Form.Item label="الدفعة الأولى [$]" name="downPayment">
                  <Input type="number" />
                </Form.Item>
                <StyledDatePickerWrapper>
                  <Form.Item label="تاريخ البدء" name="startDate">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      id="startDate"
                      name="startDate"
                      type="date"
                      showTimeSelect
                      timeIntervals={60}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      wrapperClassName="datepicker-wrapper"
                    />
                  </Form.Item>
                </StyledDatePickerWrapper>
                <StyledDatePickerWrapper>
                  <Form.Item label="تاريخ الانتهاء" name="endDate">
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      id="endDate"
                      name="endDate"
                      type="date"
                      showTimeSelect
                      timeIntervals={60}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      wrapperClassName="datepicker-wrapper"
                    />
                  </Form.Item>
                  <Form.Item name="WhatsAppButton">
                    {selectedEvent && (
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <a
                          href={generateWhatsAppLink(selectedEvent)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            type="primary"
                            style={{
                              backgroundColor: "#25D366",
                            }}
                          >
                            WhatsApp إرسال تأكيد عبر
                          </Button>
                        </a>
                      </div>
                    )}
                  </Form.Item>
                </StyledDatePickerWrapper>
              </Form>
            )}
          </Modal>
        </StyledModalWrapper>
        <Modal
          title="تأكيد الحذف"
          open={isDeleteModalVisible}
          onCancel={handleDeleteCancel}
          footer={[
            <Button key="cancel" onClick={handleDeleteCancel}>
              لا
            </Button>,
            <Button
              key="confirm"
              type="primary"
              danger
              onClick={handleDeleteConfirm}
            >
              نعم
            </Button>,
          ]}
        >
          هل أنت متأكد من حذف هذا الحدث؟
        </Modal>
      </StyledCalendarWrapper>
    </GlobalLayout>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const HeaderButtons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* oben anfangen */
  align-items: flex-end; /* rechtsbündig */
  margin-bottom: 10px;
`;

const FreeSlotsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  font-size: 16px;
  direction: rtl;
`;

const StyledCalendarWrapper = styled.div`
  width: 95%;
  position: relative;

  @media (max-width: 500px) {
    .rbc-calendar {
      font-size: 12px;
    }
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
  .datepicker-wrapper {
    width: 100%;
  }

  .ant-form-item {
    width: 100%;
  }

  .react-datepicker {
    width: 328px;
  }
  @media (max-width: 328px) {
    .react-datepicker {
      width: 100%;
    }
  }
`;

const StyledModalWrapper = styled.div`
  .custom-modal .ant-modal {
    max-width: 800px; /* Default max-width for larger screens */
  }

  @media (max-width: 768px) {
    .custom-modal .ant-modal {
      max-width: 600px; /* Width for tablets and medium screens */
    }
  }

  @media (max-width: 500px) {
    .custom-modal .ant-modal {
      max-width: 90%; /* Width for small screens, percentage based */
      width: 90%; /* Ensure the modal does not exceed the screen width */
    }
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7); // Leicht durchsichtiger Hintergrund
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; // Sicherstellen, dass es über dem Kalender liegt
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .rightAlignedButtons {
    display: flex;
    flex-direction: row;
    gap: 15px;
  }
`;

export default CalendarPage;

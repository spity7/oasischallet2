import React from "react";
import { formatLebanese, formatLebaneseDayOnly } from "../utils/dateFormats";
import styled from "styled-components";

const BookingsList = ({ bookings, onClick }) => {
  const sortedBookings = bookings.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  let lastDateStr = null;

  return (
    <>
      {sortedBookings.map((booking) => {
        const dateInfo = formatLebaneseDayOnly(booking.start);
        const showDateSeparator = dateInfo.label !== lastDateStr;
        lastDateStr = dateInfo.label;

        return (
          <React.Fragment key={booking.id}>
            {showDateSeparator && (
              <DateSeparator>
                <small style={{ fontSize: "0.8em", color: "#585858" }}>{dateInfo.prefix}</small>{" "}
                <span style={{ fontSize: "1.1em", fontWeight: "bold", color: "#585858" }}>
                  {dateInfo.label}
                </span>
              </DateSeparator>
            )}
            <FreeSlotItem
              onClick={() => onClick(booking)}
              title="فتح تفاصيل الحجز"
              style={{ cursor: "pointer", color: "#004085" }}
            >
              {formatLebanese(booking.start)} – {formatLebanese(booking.end)} | {booking.title}
            </FreeSlotItem>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default BookingsList;

const DateSeparator = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 25px;
  margin-bottom: 5px;
  color: #155724;
  border-bottom: 1px solid #d4edda;
  padding-bottom: 4px;
`;

const FreeSlotItem = styled.div`
  padding: 8px;
  border-bottom: 1px solid #d4edda;
  color: #155724;
  font-weight: 600;
`;

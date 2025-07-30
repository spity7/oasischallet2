import React from "react";
import { formatLebanese, formatLebaneseDayOnly } from "../utils/dateFormats";
import styled from "styled-components";

const FreeSlotsGroupedList = ({ slots, onClick }) => {
  const sortedSlots = slots
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  let lastDateStr = null;

  return (
    <>
      {sortedSlots.map((slot) => {
        const slotDateInfo = formatLebaneseDayOnly(slot.start);
        const showDateSeparator = slotDateInfo.label !== lastDateStr;
        lastDateStr = slotDateInfo.label;

        return (
          <React.Fragment key={slot.id}>
            {showDateSeparator && (
              <DateSeparator>
                <small style={{ fontSize: "0.8em", color: "#585858" }}>
                  {slotDateInfo.prefix}
                </small>{" "}
                <span
                  style={{
                    fontSize: "1.1em",
                    fontWeight: "bold",
                    color: "#585858",
                  }}
                >
                  {slotDateInfo.label}
                </span>
              </DateSeparator>
            )}
            <FreeSlotItem
              onClick={() => onClick(slot)}
              title="Zur Buchungsseite mit diesem Slot"
            >
              {formatLebanese(slot.start)} – {formatLebanese(slot.end)}
            </FreeSlotItem>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default FreeSlotsGroupedList;

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

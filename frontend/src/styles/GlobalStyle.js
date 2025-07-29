import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    /* Setzt Standardwerte für alle Elemente */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
    }

    /* Stil für das body-Element */
    body {
        font-family: 'Nunito', sans-serif;
        font-size: clamp(1rem, 1.5vw, 1.2rem); /* Schriftgröße relativ zur Breite des Ansichtsfensters */
        color: #009782;
        background-color: white;
    }

    /* Alle Überschriften werden auf eine davor definierte Farbe gesetzt */
    h1, h2, h3, h4, h5, h6 {
        color: #009782;
    }
`;

/* Damit 100 prozrent vermieden wird dass dieses +1 und so kommt
    .rbc-month-row {
  min-height: 120px;
  display: block;
}

.rbc-date-cell {
  height: auto;
}

.rbc-day-slot, .rbc-day-bg {
  height: auto !important;
}

.rbc-event {
  white-space: normal;
  overflow: visible;
}

.rbc-show-more {
  display: none !important;
}
*/
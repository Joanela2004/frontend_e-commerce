import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { FaCalendarAlt } from "react-icons/fa";
import { format } from "date-fns";
import "../../../styles/back-office/DateRange.css";

/* --- util : lundi de la semaine courante --- */
const getMonday = () => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return monday;
};

export default function DateRange({ onChange }) {

  /* --- états --- */
  const [start, setStart] = useState(getMonday());
  const [end, setEnd] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("week");

  /* --- format affichage --- */
  const formatDisplay = (date) => format(date, "dd/MM/yyyy");

  /* --- notifier le parent --- */
  useEffect(() => {
    if (start && end) {
      onChange({
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
        displayStart: formatDisplay(start),
        displayEnd: formatDisplay(end),
      });
    }
  }, [start, end, onChange]);

  /* --- custom input --- */
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="custom-date-input" onClick={onClick} ref={ref}>
      <FaCalendarAlt className="calendar-icon" />
      <input className="date-text-input" value={value} readOnly />
    </div>
  ));

  return (
    <div className="date-range-container">

      {/* Header */}
      <div className="date-range-header">
        <h3>
          <FaCalendarAlt />
          Sélectionner une période
        </h3>
      </div>

      {/* Dates */}
      <div className="date-range-body">

        <div className="date-picker-group">
          <label>Date de début</label>
          <DatePicker
            selected={start}
            onChange={(date) => {
              setStart(date);
              setActiveFilter(null);
            }}
            locale={fr}
            dateFormat="dd/MM/yyyy"
            customInput={<CustomInput />}
          />
        </div>

        <div className="date-picker-group">
          <label>Date de fin</label>
          <DatePicker
            selected={end}
            minDate={start}
            onChange={(date) => {
              setEnd(date);
              setActiveFilter(null);
            }}
            locale={fr}
            dateFormat="dd/MM/yyyy"
            customInput={<CustomInput />}
          />
        </div>

      </div>

      {/* Boutons rapides */}
      <div className="date-range-footer">

        <button
          className={`quick-date-btn ${activeFilter === "today" ? "active" : ""}`}
          onClick={() => {
            const today = new Date();
            setStart(today);
            setEnd(today);
            setActiveFilter("today");
          }}
        >
          Aujourd’hui
        </button>

        <button
          className={`quick-date-btn ${activeFilter === "week" ? "active" : ""}`}
          onClick={() => {
            const today = new Date();
            setStart(getMonday());
            setEnd(today);
            setActiveFilter("week");
          }}
        >
          Cette semaine
        </button>

        <button
          className={`quick-date-btn ${activeFilter === "month" ? "active" : ""}`}
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            setStart(monthAgo);
            setEnd(today);
            setActiveFilter("month");
          }}
        >
          Dernier mois
        </button>

      </div>
    </div>
  );
}

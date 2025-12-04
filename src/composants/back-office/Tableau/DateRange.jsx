import React,{ useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import { format, parse } from "date-fns";
import "../../../styles/back-office/DateRange.css"
export default function DateRange({ onChange }) {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  // Format date to dd/MM/yyyy for display
  const formatDate = (date) => {
    return format(date, 'dd/MM/yyyy');
  };

  // Parse dd/MM/yyyy to Date object
  const parseDate = (dateString) => {
    return parse(dateString, 'dd/MM/yyyy', new Date());
  };

  // Handle manual input
  const handleManualInput = (type, value) => {
    try {
      const date = parseDate(value);
      if (type === 'start') {
        setStart(date);
      } else {
        setEnd(date);
      }
    } catch (error) {
      console.error('Date invalide');
    }
  };

  // Send updates to parent whenever values change
  useEffect(() => {
    if (start && end) {
      const formattedStart = format(start, 'yyyy-MM-dd');
      const formattedEnd = format(end, 'yyyy-MM-dd');
      onChange({
        start: formattedStart,
        end: formattedEnd,
        displayStart: formatDate(start),
        displayEnd: formatDate(end)
      });
    }
  }, [start, end, onChange]);

  // Custom input component for better styling
  const CustomInput = React.forwardRef(({ value, onClick, onChange, placeholder }, ref) => (
    <div className="custom-date-input" onClick={onClick} ref={ref}>
      <FaCalendarAlt className="calendar-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="date-text-input"
        readOnly={!onChange}
      />
    </div>
  ));

  return (
    <div className="date-range-container">
      <div className="date-range-header">
        <h3>
          <FaCalendarAlt />
          Sélectionner une période
        </h3>
      </div>
      
      <div className="date-range-body">
        <div className="date-picker-group">
          <div className="date-label">
            <label htmlFor="start-date">Date de début</label>
          </div>
          <div className="date-picker-wrapper">
            <DatePicker
              selected={start}
              onChange={(date) => setStart(date)}
              dateFormat="dd/MM/yyyy"
              locale={fr}
              customInput={<CustomInput />}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="date-picker"
              id="start-date"
            />
          </div>
          <input
            type="text"
            value={formatDate(start)}
            onChange={(e) => handleManualInput('start', e.target.value)}
            placeholder="jj/mm/aaaa"
            className="date-manual-input"
          />
        </div>

        <div className="date-separator">
          <FaArrowRight />
        </div>

        <div className="date-picker-group">
          <div className="date-label">
            <label htmlFor="end-date">Date de fin</label>
          </div>
          <div className="date-picker-wrapper">
            <DatePicker
              selected={end}
              onChange={(date) => setEnd(date)}
              dateFormat="dd/MM/yyyy"
              locale={fr}
              minDate={start}
              customInput={<CustomInput />}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="date-picker"
              id="end-date"
            />
          </div>
          <input
            type="text"
            value={formatDate(end)}
            onChange={(e) => handleManualInput('end', e.target.value)}
            placeholder="jj/mm/aaaa"
            className="date-manual-input"
          />
        </div>
      </div>
      
      <div className="date-range-footer">
        <button 
          className="quick-date-btn"
          onClick={() => {
            const today = new Date();
            setStart(today);
            setEnd(today);
          }}
        >
          Aujourd'hui
        </button>
        <button 
          className="quick-date-btn"
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            setStart(weekAgo);
            setEnd(today);
          }}
        >
          Dernière semaine
        </button>
        <button 
          className="quick-date-btn"
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            setStart(monthAgo);
            setEnd(today);
          }}
        >
          Dernier mois
        </button>
      </div>
    </div>
  );
}
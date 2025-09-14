import React from 'react';
import './DatePicker.css';

const DatePicker = ({ selectedDate, onDateChange, label = "날짜 선택", disabled = false }) => {
    const handleDateChange = (e) => {
        const selectedValue = e.target.value;
        onDateChange(selectedValue);
    };

    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    const displayDate = selectedDate || today;

    return (
        <div className="date-picker-container">
            <label htmlFor="diary-date" className="date-picker-label">
                {label}
            </label>
            <input
                id="diary-date"
                type="date"
                value={displayDate}
                onChange={handleDateChange}
                disabled={disabled}
                className="date-picker-input"
            />
        </div>
    );
};

export default DatePicker;

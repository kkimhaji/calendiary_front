import React from 'react';
import '../styles/ToggleButton.css'; // CSS 파일 추가

function ToggleButton({ checked, onChange }) {
    return (
        <label className="toggle-button">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-button__slider"></span>
        </label>
    );
}

export default ToggleButton;

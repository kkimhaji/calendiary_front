// components/VisibilitySelector.js
import React from 'react';
import './VisibilitySelector.css';

const VisibilitySelector = ({ 
    visibility, 
    onChange 
}) => {
    const visibilityOptions = [
        {
            value: 'PUBLIC',
            label: '공개',
            icon: '🌍',
            description: '모든 사람이 볼 수 있습니다'
        },
        {
            value: 'PRIVATE',
            label: '비공개',
            icon: '🔒',
            description: '나만 볼 수 있습니다'
        }
    ];

    return (
        <div className="visibility-selector">
            <h4 className="visibility-title">공개 범위</h4>
            <div className="visibility-options">
                {visibilityOptions.map(option => (
                    <label 
                        key={option.value}
                        className={`visibility-option ${visibility === option.value ? 'selected' : ''}`}
                    >
                        <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={visibility === option.value}
                            onChange={() => onChange(option.value)}
                            className="visibility-radio"
                        />
                        <div className="option-content">
                            <div className="option-header">
                                <span className="option-icon">{option.icon}</span>
                                <span className="option-label">{option.label}</span>
                            </div>
                            <span className="option-description">{option.description}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default VisibilitySelector;

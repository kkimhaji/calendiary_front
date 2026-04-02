// components/Tabs.js
import React from 'react';
import './Tabs.css';

export const Tabs = ({ children, activeTab, onChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {React.Children.map(children, (child) => (
          <button
            className={`tab-button ${activeTab === child.props.id ? 'active' : ''}`}
            onClick={() => onChange(child.props.id)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {React.Children.map(children, (child) => (
          activeTab === child.props.id ? child : null
        ))}
      </div>
    </div>
  );
};

export const Tab = ({ children, id }) => {
  return <div className="tab-pane">{children}</div>;
};
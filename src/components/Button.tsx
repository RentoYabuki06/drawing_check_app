import React from 'react';

type ButtonProps = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  color: string;
};

const Button: React.FC<ButtonProps> = ({ label, icon, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 40px',
        backgroundColor: color,
        color: '#ffffff',
        borderRadius: '35px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: 'clamp(12px, 2.5vw, 20px)',
      }}
    >
      {icon && <span style={{ marginRight: '10px' }}>{icon}</span>}
      {label}
    </button>
  );
};

export default Button;

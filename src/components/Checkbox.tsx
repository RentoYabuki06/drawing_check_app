import React from 'react';

type CheckboxProps = {
  label: string;
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const Checkbox: React.FC<CheckboxProps> = ({ label, name, checked, onChange }) => {
  return (
    <label style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ width: '30px', height: '30px', marginRight: '12px' }}
      />
      {label}
    </label>
  );
};

export default Checkbox;

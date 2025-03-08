import React from "react";

type StepButtonProps = {
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

const StepButton: React.FC<StepButtonProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        textAlign: "center",
        padding: "15px 20px",
        backgroundColor: isActive ? "#007bff" : "#e0e0e0", // アクティブ時は青、非アクティブ時はグレー
        color: isActive ? "#ffffff" : "#555555", // アクティブ時は白文字、非アクティブ時は黒文字
        border: "none",
        fontWeight: isActive ? "bold" : "normal",
      }}
    >
      {label}
    </div>
  );
};

export default StepButton;

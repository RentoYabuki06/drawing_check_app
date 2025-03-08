import React from 'react';
import { Color } from '@/const/Color';

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
};

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive = false, onClick }) => {
  return (
    <li
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        margin: '5px',
        padding: '10px 15px', // 背景色が見えるようにパディングを追加
        color: isActive ? '#FFF' : '#000', // isActive で文字色を変更
        backgroundColor: isActive ? Color.BLUE_DEEP : 'transparent', // isActive で背景色を変更
        fontWeight: isActive ? 'bold' : 'normal',
        borderRadius: '5px', // 見た目を整えるために角を丸める
        cursor: 'pointer',
        transition: 'all 0.3s ease', // スムーズな色変化
      }}
    >
      <span style={{ marginRight: '10px', color: isActive ? '#FFF' : '#000' }}>{icon}</span>
      {label}
    </li>
  );
};

export default SidebarItem;

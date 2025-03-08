import React from 'react';
import { FaHome, FaPlus, FaDatabase, FaUserCog } from 'react-icons/fa';
import { Color } from '@/const/Color';
import SidebarItem from './SidebarItem';

const Sidebar = () => {
  return (
    <nav style={{ width: '300px', padding: '20px', borderRight: '1px solid #ddd' }}>
      <img
        src="/icon_kenzu_ai.png"
        alt="Icon"
        style={{ width: '100%', margin: '10px', marginBottom: '40px', color: Color.BLUE_DEEP }}
      />
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <SidebarItem icon={<FaHome />} label="ホーム" isActive />
        <SidebarItem icon={<FaPlus />} label="新規登録" />
        <SidebarItem icon={<FaDatabase />} label="データベース" />
        <SidebarItem icon={<FaUserCog />} label="アカウント管理" />
      </ul>
    </nav>
  );
};

export default Sidebar;

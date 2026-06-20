'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const toggleMobile = () => setIsMobileOpen(prev => !prev);

  return (
    <div className="flex w-full min-h-screen relative overflow-x-hidden">
      {/* TopBar with toggle props */}
      <TopBar 
        isCollapsed={isCollapsed} 
        toggleSidebar={toggleSidebar} 
        toggleMobile={toggleMobile} 
      />
      
      {/* Sidebar with collapse state and props */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen} 
        toggleSidebar={toggleSidebar} 
        toggleMobile={toggleMobile} 
      />

      {/* Main Content Area */}
      <main className={`flex-1 pt-20 flex flex-col min-h-screen relative w-full transition-all duration-300 ease-in-out ${
        isCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        {children}
      </main>
    </div>
  );
}

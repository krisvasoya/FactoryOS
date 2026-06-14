import React from 'react';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import AIAssistant from '@/components/ai-assistant';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col pl-64">
        {/* Upper Header bar */}
        <Header />

        {/* Scrollable View Area */}
        <main
          className="flex-1 overflow-y-auto animate-fade-in"
          style={{
            paddingTop: '5rem',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            paddingBottom: '2.5rem',
          }}
        >
          {children}
        </main>
      </div>

      {/* Floating AI Co-Pilot Assistant */}
      <AIAssistant />
    </div>
  );
}

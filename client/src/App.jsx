import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import LiveMapPage from './pages/LiveMapPage';
import SystemArchitectureView from './pages/SystemArchitectureView';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'citizen':
        return <CitizenDashboard />;
      case 'map':
        return <LiveMapPage />;
      case 'authority':
        return <AuthorityDashboard />;
      case 'architecture':
        return <SystemArchitectureView />;
      case 'login':
        return <LoginPage onNavigate={setCurrentView} />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
          <Navbar currentView={currentView} setCurrentView={setCurrentView} />
          <main className="flex-1">
            {renderView()}
          </main>
          <Footer />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Janashakti ErrorBoundary captured error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-subtle">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [navParams, setNavParams] = useState({});

  const handleNavigate = (view, params = {}) => {
    setNavParams(params);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'citizen':
        return (
          <CitizenDashboard
            initialCategory={navParams.category}
            initialTab={navParams.tab || 'report'}
          />
        );
      case 'map':
        return <LiveMapPage />;
      case 'authority':
        return <AuthorityDashboard />;
      case 'architecture':
        return <SystemArchitectureView />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
            <Navbar currentView={currentView} setCurrentView={handleNavigate} />
            <main className="flex-1">
              <ErrorBoundary>
                {renderView()}
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

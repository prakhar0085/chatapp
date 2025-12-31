import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { Loader } from 'lucide-react';
import Navbar from './components/Navbar';
import { useThemeStore } from './store/useThemeStore';
import { useCallStore } from './store/useCallStore';
import VideoCall from './components/VideoCall';
import { useChatStore } from './store/useChatStore';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { setCallIncoming } = useCallStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (socket) {
      subscribeToMessages();

      socket.on("callUser", (data) => {
        setCallIncoming({ _id: data.from, fullName: data.name, name: data.name, profilePic: data.profilePic }, data.signal);
      });

      return () => {
        unsubscribeFromMessages();
        socket.off("callUser");
      };
    }
  }, [socket, setCallIncoming, subscribeToMessages, unsubscribeFromMessages]);


console.log(authUser);

if(isCheckingAuth && !authUser){
  return (
    <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
    </div>
  )
}
 
  return (
    <div data-theme={theme}>
      <Navbar/>
      <Routes>
      <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />

      </Routes>
      <VideoCall />
      <Toaster />
    </div>
  )
}

export default App


// import React from 'react';

// const App = () => {
//   return (
//     <div>App</div>
//   );
// };

// export default App;

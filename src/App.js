import React, { useEffect, useState } from 'react';
import Particles from './Particles';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { Slide, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TOAST_NOTIFICATION_TYPES } from './common/types';

function App() {
  const [particles, setParticles] = useState(['asd']);
  const [interval, setInterval] = useState(null);
  const [replayLoad, setReplayLoad] = useState(true);

  const toastNotificationHandler = (type, message) => {
    const options = {
      position: 'bottom-right',
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark'
    };
    switch (type) {
      case TOAST_NOTIFICATION_TYPES.ERROR:
        toast.error(message, options);
        break;
      default:
        toast.info(message, options);
    }
  };

  useEffect(() => {
    window.electronAPI.waitForToastNotification(toastNotificationHandler);
  }, []);

  useEffect(() => {
    fetchParticles(setParticles, setReplayLoad);
    if (Number(interval)) {
      clearInterval(interval);
    }

    const i =
      replayLoad === true
        ? autoFetch(setParticles, setReplayLoad, 2000)
        : autoFetch(setParticles, setReplayLoad, 10000);
    setInterval(i);
    return () => {
      clearInterval(i);
    };
  }, [replayLoad]);

  if (particles.length === 0) {
    return (
      <>
        <header className="absolute right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
        <div className="w-screen flex h-screen items-center justify-center">
          <span className="text-3xl">Waiting for the replay...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="absolute right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
      <Particles props={{ particles, setParticles, interval, setInterval, setReplayLoad }} />
      <footer className="text-white absolute right-0 bottom-0 mb-2">
        <span className="sm:text-xs text-[0px]">Created by </span>
        <span className="sm:text-xs text-xxs font-bold">dx droni#9467</span>
        <span className="sm:text-xs text-[0px]"> mrdroonix@gmail.com</span>
      </footer>
      <ToastContainer
        position="bottom-right"
        transition={Slide}
        autoClose={10000}
        limit={8}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;

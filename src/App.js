import 'react-toastify/dist/ReactToastify.css';

import React, { useContext, useEffect, useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import { LoadingContext, ParticlesContext } from './AppContext';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { TOAST_NOTIFICATION_TYPES } from './common/types';
import Particles from './Particles';

function App() {
  const { interval, setInterval, replayLoad, setReplayLoad } = useContext(LoadingContext);
  const { particles, setParticles } = useContext(ParticlesContext);
  const [loadingToastId, setLoadingToastId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toastNotificationHandler = (type, message) => {
    const options = {
      position: 'bottom-right',
      autoClose: 7000,
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
      case TOAST_NOTIFICATION_TYPES.WARN:
        toast.warn(message, options);
        break;
      case TOAST_NOTIFICATION_TYPES.LOADING:
        setLoadingToastId(toast.loading(message));
        window.electronAPI.focusMainWindow();
        break;
      default:
        toast.info(message, options);
    }
  };

  useEffect(() => {
    window.electronAPI.waitForToastNotification(toastNotificationHandler);
  }, []);

  useEffect(() => {
    fetchParticles(setParticles, replayLoad, setReplayLoad);
    if (Number(interval)) {
      clearInterval(interval);
    }

    const i =
      replayLoad === true || replayLoad === null
        ? autoFetch(setParticles, replayLoad, setReplayLoad, 2000)
        : autoFetch(setParticles, replayLoad, setReplayLoad, 7000);
    setInterval(i);

    if (replayLoad === true) {
      toastNotificationHandler(
        TOAST_NOTIFICATION_TYPES.LOADING,
        'Cannot find the replay. Save the disabled particles to file to not lose them!'
      );
    }

    if (replayLoad === false && loadingToastId !== null) {
      toast.update(loadingToastId, {
        render: 'The replay has been found',
        type: 'success',
        autoClose: 3000,
        isLoading: false
      });
    }

    return () => {
      clearInterval(i);
    };
  }, [replayLoad]);

  if (particles.length === 0) {
    return (
      <>
        <header className="absolute right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
        <div className="flex h-screen w-screen items-center justify-center">
          <span className="text-loader text-3xl">Waiting for the replay...</span>
        </div>
      </>
    );
  }

  function handleModal() {
    setIsModalOpen(!isModalOpen);

    const modalContainer = document.getElementById('ModalContainer');
    modalContainer.classList.toggle('opacity-0');
    modalContainer.classList.toggle('pointer-events-none');

    const modalBox = document.getElementById('ModalBox');
    modalBox.classList.toggle('opacity-0');
    modalBox.classList.toggle('pointer-events-none');
  }

  return (
    <>
      <header className="absolute right-3 top-0 flex gap-4">
        <button onClick={handleModal}>Help</button>
        <span>v{process.env.REACT_APP_VERSION}</span>
      </header>
      <Particles />
      <footer className="absolute bottom-2 right-3 text-white">
        <span className="text-[0px] sm:text-xs">Created by </span>
        <span className="text-xxs font-bold sm:text-xs">dx droni#9467</span>
        <span className="text-[0px] sm:text-xs"> mrdroonix@gmail.com</span>
      </footer>
      <ToastContainer
        position="bottom-right"
        transition={Slide}
        limit={7}
        newestOnTop
        theme="dark"
      />
      <div
        id="ModalContainer"
        className="modal-container-transition pointer-events-none fixed inset-0 z-20 flex items-center justify-center bg-slate-900 bg-opacity-50 opacity-0"
        onClick={(e) => (e.target === e.currentTarget ? handleModal() : null)}
      >
        <div
          id="ModalBox"
          className="modal-transition pointer-events-none flex flex-col rounded-lg border border-gray-400 bg-slate-800 p-4 opacity-0 shadow-2xl"
        >
          <div className="mb-3 flex justify-between">
            <h3 className="text-2xl font-bold">How to use this tool?</h3>
            <button onClick={handleModal}>Close</button>
            {/* icon */}
          </div>
          <h4 className="mb-2 text-xl font-bold">Particle Locator</h4>
          <h5 className="text-lg text-teal-400">Auto mode</h5>
          <div className="ml-1.5">
            <p>
              Video tutorial:{' '}
              <a
                className="text-blue-400 underline"
                target="_blank"
                rel="noreferrer"
                href="https://youtu.be/FvQJKjt-hYk?t=28"
              >
                https://youtu.be/FvQJKjt-hYk?t=28
              </a>
            </p>
            <ol className="ml-8 list-decimal">
              <li>Open the replay</li>
              <li>
                Set in-game window mode to either <span className="font-bold">Borderless</span> or{' '}
                <span className="font-bold">Windowed</span>
              </li>
              <li>
                Open Particle Locator and click <span className="font-bold">Start</span>
              </li>
              <li>
                Select the particle(s) that you want to disable (and automatically find their name)
              </li>
            </ol>
          </div>
          <h5 className="text-lg text-red-400">Legacy mode</h5>
          <div className="ml-1.5">
            <p>
              Video tutorial:{' '}
              <a
                className="text-blue-400 underline"
                target="_blank"
                rel="noreferrer"
                href="https://youtu.be/FvQJKjt-hYk?t=28"
              >
                https://youtu.be/FvQJKjt-hYk?t=28
              </a>
            </p>
            <ul className="ml-8 list-decimal list-disc">
              <li>
                Same as auto mode, except that you have to manually select whether a particle has
                changed its state (appeared / disappeared)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

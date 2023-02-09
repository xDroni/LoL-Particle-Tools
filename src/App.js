import 'react-toastify/dist/ReactToastify.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import { LoadingContext, ParticlesContext } from './AppContext';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import ModalContainer from './ModalContainer';
import Particles from './Particles';

const electronAPI = window.electronAPI;
const TOAST_NOTIFICATION_TYPES = window.TOAST_NOTIFICATION_TYPES;

function App() {
  const { interval, setInterval, replayLoad, setReplayLoad } = useContext(LoadingContext);
  const { particles, setParticles, particlesByState } = useContext(ParticlesContext);
  const [loadingToastId, setLoadingToastId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toastNotificationHandler = (type, message) => {
    const options = {
      position: 'bottom-right',
      autoClose: 5000,
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
        setLoadingToastId(toast.loading(message, { ...options, autoClose: false }));
        break;
      default:
        toast.info(message, options);
    }
  };

  useEffect(() => {
    electronAPI.waitForToastNotification(toastNotificationHandler);
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
        'Replay not found. Save the deactivated particles to a file to not lose them!'
      );

      if (particlesByState.inactive.length === 0) {
        return;
      }

      electronAPI.focusMainWindow();
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
        <header className="absolute right-3 top-1 flex items-center gap-4">
          <button type="button" className="btn btn-slate btn-responsive" onClick={handleModal}>
            <FontAwesomeIcon className="initial md:mr-1" icon="fa-solid fa-circle-question" />
            Help
          </button>
          <span>v{process.env.REACT_APP_VERSION}</span>
        </header>
        <ModalContainer handleModal={handleModal} />
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
      <header className="absolute right-3 top-1 flex items-center gap-4">
        <button type="button" className="btn btn-slate btn-responsive" onClick={handleModal}>
          <FontAwesomeIcon className="initial md:mr-1" icon="fa-solid fa-circle-question" />
          Help
        </button>
        <span>v{process.env.REACT_APP_VERSION}</span>
      </header>
      <Particles />
      <footer className="absolute bottom-2 right-3 text-white">
        <span className="hidden lg:inline lg:text-xs">Created by </span>
        <span className="text-xs font-bold">dx droni#9467</span>
        <span className="hidden lg:inline lg:text-xs"> mrdroonix@gmail.com</span>
      </footer>
      <ToastContainer
        position="bottom-right"
        transition={Slide}
        limit={7}
        newestOnTop
        theme="dark"
      />
      <ModalContainer handleModal={handleModal} />
    </>
  );
}

export default App;

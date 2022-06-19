import { useEffect, useState } from 'react';
import Particles from './Particles';
import fetchParticles, { autoFetch } from './common/fetchParticles';

function App() {
  const [particles, setParticles] = useState([]);
  const [interval, setInterval] = useState(null);
  const [replayLoad, setReplayLoad] = useState(true);

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
        <header className="fixed right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
        <div className="w-screen flex h-screen items-center justify-center">
          <span className="text-3xl">Waiting for the replay...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="fixed right-0 top-0">v{process.env.REACT_APP_VERSION}</header>
      <div className="mt-4">
        <Particles props={{ particles, setParticles, interval, setInterval, setReplayLoad }} />
      </div>
      <footer className="text-white fixed right-0 bottom-0 mr-4 mb-2">
        <span className="sm:text-xs text-[0px]">Created by </span>
        <span className="sm:text-xs text-xxs font-bold">dx droni#9467</span>
        <span className="sm:text-xs text-[0px]"> mrdroonix@gmail.com</span>
      </footer>
    </>
  );
}

export default App;

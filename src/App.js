import { useEffect, useState } from 'react';
import Particles from './Particles';
import { autoFetch } from './common/fetchParticles';

function App() {
  const [particles, setParticles] = useState([]);
  const [interval, setInterval] = useState(null);

  useEffect(() => {
    if (Number(interval)) {
      clearInterval(interval);
    }

    const i = autoFetch(setParticles);
    setInterval(i);
    return () => {
      clearInterval(i);
    };
  }, []);

  if (particles.length === 0) {
    return (
      <div className="w-screen flex h-screen items-center justify-center">
        <span className="text-3xl">Waiting for the replay...</span>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4">
        <Particles
          particles={particles}
          setParticles={setParticles}
          interval={interval}
          setInterval={setInterval}
        />
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

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
      <footer className="text-white text-xs fixed right-0 bottom-0 mr-8 mb-2">
        <span>Created by</span> <span className="font-bold">dx droni#9467</span>,
        mrdroonix@gmail.com
      </footer>
    </>
  );
}

export default App;

import { useEffect, useState } from 'react';
import Particles from './Particles';
import config from './config.json';

function App() {
  const [particles, setParticles] = useState([]);

  function getParticles() {
    fetch(`${config.address}:${config.port}/replay/${config.particlesEndpoint}`)
      .then((res) => res.json())
      .then((res) => setParticles(res))
      .catch((e) => console.error(e));
  }

  useEffect(() => {
    getParticles();
  }, []);

  return (
    <>
      <div className="text-slate-200 mt-4">
        <Particles particles={particles} setParticles={setParticles} />
        {/*<button className="btn btn-slate" onClick={() => getParticles()}>*/}
        {/*  Refresh*/}
        {/*</button>*/}
      </div>
      <footer className="text-white text-xs fixed right-0 bottom-0 mr-8 mb-2">
        <span>Created by</span> <span className="font-bold">dx droni#9467</span>,
        mrdroonix@gmail.com
      </footer>
    </>
  );
}

export default App;

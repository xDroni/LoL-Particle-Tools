import { useEffect, useState } from "react";
import Particles from "./Particles";
import DisableParticles from "./DisableParticles";
import ParticleLocator from "./ParticleLocator";
import config from "./config.json";

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
    <div className="text-slate-200 mt-4">
      <Particles particles={particles} />
      <DisableParticles setParticles={setParticles} />
      <button onClick={() => getParticles()}>Refresh</button>
      <ParticleLocator particles={particles} setParticles={setParticles} />
    </div>
  );
}

export default App;

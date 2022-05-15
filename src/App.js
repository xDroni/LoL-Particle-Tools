import { useEffect, useState } from "react";
import Particles from "./Particles";
import DisableParticles from "./DisableParticles";
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
    <>
      <Particles particles={particles} />
      <DisableParticles setParticles={setParticles} />
      <button onClick={() => getParticles()}>Refresh</button>
    </>
  );
}

export default App;

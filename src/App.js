import { useEffect, useState } from "react";
import Particles from "./Particles";

function App() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    fetch("https://127.0.0.1:2999/replay/particles")
      .then((res) => res.json())
      .then((res) => {
        setParticles(() => res);
      });
  }, []);

  return (
    <>
      <Particles particles={particles} />
      <input type="text" />
      <button>Disable Particles</button>
      <button>Refresh</button>
    </>
  );
}

export default App;

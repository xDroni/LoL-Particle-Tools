import React, { useState } from "react";
import config from "./config.json";

export default function DisableParticles({ setParticles }) {
  const [particlesToDisable, setParticlesToDisable] = useState("");

  async function postParticles() {
    const particlesToDisableJSON = particlesToDisable.split("\n").reduce(
      (prev, curr) => ({
        ...prev,
        ...(curr.trim().length ? { [curr.trim()]: false } : {}),
      }),
      {}
    );

    fetch(
      `${config.address}:${config.port}/replay/${config.particlesEndpoint}`,
      {
        method: "POST",
        body: JSON.stringify(particlesToDisableJSON),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => setParticles(res))
      .catch((e) => console.error(e));
  }

  function handleFile() {
    const file = document.getElementById("file").files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = (f) => {
      document.getElementById("particlesToDisable").value = f.target.result;
      setParticlesToDisable(f.target.result.toString());
    };
    fileReader.readAsText(file, "UTF-8");
  }

  return (
    <>
      <textarea
        id="particlesToDisable"
        onChange={(e) => setParticlesToDisable(e.target.value)}
        value={particlesToDisable}
      ></textarea>
      <button onClick={() => postParticles()}>Disable Particles</button>

      <label>Load from file</label>
      <input type="file" id="file" />
      <button onClick={handleFile}>Load</button>
    </>
  );
}
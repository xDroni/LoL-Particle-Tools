import React, { useState } from "react";
import config from "./config.json";

export default function DisableParticles({ setParticles }) {
  const [particlesToDisable, setParticlesToDisable] = useState("");

  async function postParticles() {
    const particlesToDisableJSON = Object.assign(
      {},
      ...particlesToDisable
        .split("\n")
        .filter((e) => e.trim().length)
        .map((e) => ({ [e.trim()]: false }))
    );

    const response = await fetch(
      `${config.address}:${config.port}/replay/${config.particlesEndpoint}`,
      {
        method: "POST",
        body: JSON.stringify(particlesToDisableJSON),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const json = await response.json();
    setParticles(() => json);
  }

  return (
    <>
      <textarea
        onChange={(e) => setParticlesToDisable(e.target.value)}
      ></textarea>
      <button onClick={() => postParticles()}>Disable Particles</button>
    </>
  );
}

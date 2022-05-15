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

  return (
    <>
      <textarea
        onChange={(e) => setParticlesToDisable(e.target.value)}
      ></textarea>
      <button onClick={() => postParticles()}>Disable Particles</button>
    </>
  );
}

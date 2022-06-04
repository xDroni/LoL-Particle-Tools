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
      <span className="block mb-2 uppercase">List to disable</span>
      <textarea
        id="particlesToDisable"
        className="bg-slate-800 h-1/4 w-2/3 rounded-xl overflow-auto no-scrollbar block ml-auto mr-auto mb-4"
        onChange={(e) => setParticlesToDisable(e.target.value)}
        value={particlesToDisable}
      ></textarea>
      <button
        className="block ml-auto mr-auto btn btn-slate mb-4"
        onClick={() => postParticles()}
      >
        Disable Particles
      </button>

      <input type="file" id="file" onChange={handleFile} />
    </>
  );
}

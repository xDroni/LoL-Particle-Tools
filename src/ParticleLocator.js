import React, { useEffect, useState } from "react";

export default function ParticleLocator({
  particles,
  setParticles,
  locationInProgress,
  setLocationInProgress,
}) {
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particleName, setParticleName] = useState(null);

  useEffect(() => {
    if (split === null) return;

    async function post() {
      const stateChanged = split.entries1.map(([key, value]) => [key, !value]);
      const json = Object.fromEntries(stateChanged);
      split.entries1 = stateChanged;
      const result = await fetch("https://127.0.0.1:2999/replay/particles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await result.json();
      setParticles(data);
    }

    setIsLoading(true);
    void post().then(() => setIsLoading(false));
  }, [split]);

  async function findParticle(entries) {
    if (entries.length === 1) {
      setParticleName(entries[0][0]);
      setLocationInProgress(false);
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2),
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-slate mb-4"
        onClick={() => {
          setParticleName(null);
          setLocationInProgress(true);
          return findParticle(Object.entries(particles));
        }}
      >
        Particle Locator
      </button>
      <div className="flex gap-4 justify-center mb-4">
        <button
          type="button"
          className="block btn btn-slate w-12 h-12 disabled:bg-slate-800"
          onClick={() => findParticle(split.entries1)}
          disabled={isLoading || !locationInProgress}
        >
          Y
        </button>
        <button
          type="button"
          className="block btn btn-slate w-12 h-12 disabled:bg-slate-800"
          onClick={() => findParticle(split.entries2)}
          disabled={isLoading || !locationInProgress}
        >
          N
        </button>
      </div>
      {particleName !== null ? (
        <>
          <p>Particle name: </p>
          <span className="font-bold">{particleName}</span>
        </>
      ) : null}
    </>
  );
}

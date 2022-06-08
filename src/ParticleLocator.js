import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';

export default function ParticleLocator({
  particles,
  setParticles,
  locationInProgress,
  setLocationInProgress
}) {
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particleName, setParticleName] = useState(null);
  const particlesStateToRestore = useRef([]);

  useEffect(() => {
    if (split === null) return;

    async function post() {
      const stateChanged = split.entries1.map(([key, value]) => [key, !value]);
      const json = Object.fromEntries(stateChanged);
      split.entries1 = stateChanged;
      await postParticles(json, setParticles);
    }

    setIsLoading(true);
    void post().then(() => setIsLoading(false));
  }, [split, setParticles]);

  async function findParticle(entries) {
    if (entries.length === 1) {
      await postParticles(particlesStateToRestore.current);
      setParticles(particlesStateToRestore.current);
      setParticleName(entries[0][0]);
      setLocationInProgress(false);
      return;
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2)
    });
  }

  function handleParticleLocator() {
    particlesStateToRestore.current = particles;
    setParticleName(null);
    setLocationInProgress(true);
    void findParticle(Object.entries(particles));
  }

  return (
    <>
      <button type="button" className="btn btn-slate mb-4" onClick={handleParticleLocator}>
        Particle Locator
      </button>
      {locationInProgress === true ? (
        <>
          <div className="mb-2">Did change?</div>
          <div className="flex gap-4 justify-center mb-4">
            <button
              type="button"
              className="block btn btn-slate w-12 h-12 disabled:bg-slate-800"
              onClick={() => findParticle(split.entries1)}
              disabled={isLoading || !locationInProgress}>
              Yes
            </button>
            <button
              type="button"
              className="block btn btn-slate w-12 h-12 disabled:bg-slate-800"
              onClick={() => findParticle(split.entries2)}
              disabled={isLoading || !locationInProgress}>
              No
            </button>
          </div>
        </>
      ) : null}
      {particleName !== null ? (
        <>
          <p>Particle name: </p>
          <span className="font-bold">{particleName}</span>
        </>
      ) : null}
    </>
  );
}

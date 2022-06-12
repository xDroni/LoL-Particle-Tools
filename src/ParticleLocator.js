import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      return stopLocating(entries);
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2)
    });
  }

  async function handleParticleLocator() {
    if (locationInProgress === true) {
      return stopLocating();
    }

    particlesStateToRestore.current = particles;
    setParticleName(null);
    setLocationInProgress(true);
    return findParticle(Object.entries(particles));
  }

  async function stopLocating(entries) {
    await postParticles(particlesStateToRestore.current, setParticles);
    setParticles(particlesStateToRestore.current);
    if (entries !== undefined) {
      setParticleName(entries[0][0]);
    }
    setLocationInProgress(false);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-slate btn-responsive mb-4"
        onClick={handleParticleLocator}
      >
        <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-crosshairs" size="lg" />
        {locationInProgress === false ? 'Particle Locator' : 'Cancel locating'}
      </button>
      {locationInProgress === true ? (
        <>
          <div className="mb-2">Did change?</div>
          <div className="flex gap-4 justify-center mb-4">
            <button
              type="button"
              className="block btn btn-slate w-8 h-8 lg:w-12 lg:h-12 disabled:bg-slate-800"
              onClick={() => findParticle(split.entries1)}
              disabled={isLoading || !locationInProgress}
            >
              Yes
            </button>
            <button
              type="button"
              className="block btn btn-slate w-8 h-8 lg:w-12 lg:h-12 disabled:bg-slate-800"
              onClick={() => findParticle(split.entries2)}
              disabled={isLoading || !locationInProgress}
            >
              No
            </button>
          </div>
        </>
      ) : null}
      {particleName !== null ? (
        <>
          <div className="mb-9">
            <p>Particle name: </p>
            <span className="font-bold">{particleName}</span>
          </div>
          <button
            type="button"
            className="block ml-auto mr-auto btn btn-slate"
            onClick={() => postParticles({ [particleName]: false }, setParticles)}
          >
            Disable particle
          </button>
        </>
      ) : null}
    </>
  );
}

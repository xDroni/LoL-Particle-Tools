import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import NewWindowComponent from "./NewWindowComponent";
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
  const [isNewWindow, setIsNewWindow] = useState(false);
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

  // eslint-disable-next-line no-unused-vars
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
        onClick={() => setIsNewWindow(true)}>
        <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-crosshairs" size="lg" />
        Particle Locator
      </button>
      {isNewWindow === true && (
        <NewWindowComponent onClose={() => setIsNewWindow(false)}>
          <button
            type="button"
            className="btn btn-slate mb-4 h-8 text-xl"
            onClick={handleParticleLocator}>
            <FontAwesomeIcon className="mr-1" icon="fa-solid fa-crosshairs" size="lg" />
            {locationInProgress === false ? 'Start' : 'Stop'}
          </button>
          {locationInProgress === true ? (
            <>
              <div className="mb-2 text-xl">Did change?</div>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => findParticle(split.entries1)}
                  disabled={isLoading || !locationInProgress}>
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => findParticle(split.entries2)}
                  disabled={isLoading || !locationInProgress}>
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
                onClick={() => postParticles({ [particleName]: false }, setParticles)}>
                Disable particle
              </button>
            </>
          ) : null}
        </NewWindowComponent>
      )}
    </>
  );
}

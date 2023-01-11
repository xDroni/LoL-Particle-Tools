import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import ParticleLocatorWindow from './ParticleLocatorWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { COMPARISON_RESULT_STATE, MODE } from './common/types';
import listOfItems from './common/listOfItems';

export default function ParticleLocator({ props }) {
  const {
    setParticles,
    locationInProgress,
    setLocationInProgress,
    interval,
    setInterval,
    setReplayLoad
  } = props;
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particleName, setParticleName] = useState(null);
  const [isNewWindow, setIsNewWindow] = useState(false);
  const [hashToCompare, setHashToCompare] = useState(null);
  const [foundParticles, setFoundParticles] = useState([]);
  const [hashComparisonsResult, setHashComparisonsResult] = useState([]);
  const particlesStateToRestore = useRef([]);
  const mode = MODE.AUTO;

  useEffect(() => {
    if (split === null) return;

    async function post() {
      const stateChanged = split.entries1.map(([key, value]) => [key, !value]);
      const json = Object.fromEntries(stateChanged);
      split.entries1 = stateChanged;
      await postParticles(json, setParticles);
    }

    setIsLoading(true);
    void post().then(async () => {
      setIsLoading(false);
      if (mode === MODE.LEGACY) {
        return;
      }

      window.electronAPI.sendHashRequest();
      const hash = await getHash();
      if (hash !== hashToCompare) {
        console.log(Date.now(), 'changed!');
        setHashComparisonsResult((prev) => [...prev, COMPARISON_RESULT_STATE.DID_CHANGE]);
        setHashToCompare(hash);
        return await findParticle(split.entries1);
      }
      console.log(Date.now(), 'didnt change');
      setHashComparisonsResult((prev) => [...prev, COMPARISON_RESULT_STATE.DID_NOT_CHANGE]);
      return await findParticle(split.entries2);
    });
  }, [split, setParticles]);

  async function getHash() {
    return await window.electronAPI.waitForHashResponse();
  }

  async function findParticle(entries) {
    if (entries.length === 0) {
      return stopLocating();
    }

    if (entries.length === 1 && mode === MODE.LEGACY) {
      // setInterval(autoFetch(setParticles, setReplayLoad, 10000)); // needed? it's also called in stopLocating
      setParticleName(entries[0][0]);
      return stopLocating();
    }

    if (entries.length === 1 && mode === MODE.AUTO) {
      const allFound = hashComparisonsResult.every(
        (result) => result === COMPARISON_RESULT_STATE.DID_NOT_CHANGE
      );
      setHashComparisonsResult([]);
      console.log('#all found', allFound, hashComparisonsResult);
      if (allFound) {
        return stopLocating();
      }
      const foundParticle = entries[0][0];
      console.log('#found', foundParticle);
      setFoundParticles((prev) => [...prev, foundParticle]);
      await postParticles({ [foundParticle]: false }, setParticles);

      window.electronAPI.sendHashRequest();
      const firstHash = await getHash();
      console.log('#firstHasth', firstHash);
      setHashToCompare(() => firstHash);
      return findParticle(await fetchParticles(setParticles, setReplayLoad, true));
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2)
    });
  }

  async function handleParticleLocator(mode) {
    if (locationInProgress === true) {
      setInterval(autoFetch(setParticles, setReplayLoad, 10000));
      return stopLocating();
    }

    clearInterval(interval);
    const enabledParticles = await fetchParticles(setParticles, setReplayLoad, true);
    console.log('Saving particles to restore');
    particlesStateToRestore.current = enabledParticles;
    setParticleName(null);
    setFoundParticles([]);
    setLocationInProgress(true);

    if (mode === MODE.LEGACY) {
      return findParticle(enabledParticles);
    }

    // don't request because the first hash should come when user selects the area
    // window.electronAPI.sendHashRequest();
    const firstHash = await getHash();
    console.log('#firstHasth', firstHash);

    setHashToCompare(() => firstHash);
    return findParticle(enabledParticles);
  }

  async function stopLocating() {
    console.log('Restoring particles after locating');
    await postParticles(particlesStateToRestore.current, setParticles);
    setParticles(particlesStateToRestore.current);

    console.log(foundParticles, particleName);

    setLocationInProgress(false);
    clearInterval(interval);
    setInterval(autoFetch(setParticles, setReplayLoad, 10000));
  }

  function handleDidChange(didChange) {
    if (locationInProgress === false) {
      return;
    }
    return didChange === true ? findParticle(split.entries1) : findParticle(split.entries2);
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-slate btn-responsive sm:mb-4 mb-1"
        onClick={() => setIsNewWindow(true)}
      >
        <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-crosshairs" size="lg" />
        Particle Locator
      </button>
      {/* Legacy Particle Locator */}
      {isNewWindow === true && mode === MODE.LEGACY && (
        <ParticleLocatorWindow
          handleDidChange={handleDidChange}
          onClose={() => {
            setIsNewWindow(false);
            if (locationInProgress) void stopLocating();
          }}
        >
          <button
            type="button"
            className="btn btn-slate h-12 text-xl mt-2 sm:mb-4 mb-1"
            onClick={() => handleParticleLocator(MODE.LEGACY)}
          >
            {locationInProgress === false ? 'Start' : 'Stop'}
          </button>
          {locationInProgress === true ? (
            <>
              <div className="mb-2 text-xl">Did change?</div>
              <div className="flex gap-6 justify-center">
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => handleDidChange(true)}
                  disabled={isLoading || !locationInProgress}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => handleDidChange(false)}
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
                <p className="text-xl mb-2">Particle name: </p>
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
        </ParticleLocatorWindow>
      )}
      {/* Auto Particle Locator */}
      {isNewWindow === true && mode === MODE.AUTO && (
        <ParticleLocatorWindow
          handleDidChange={handleDidChange}
          onClose={() => {
            setIsNewWindow(false);
            if (locationInProgress) void stopLocating();
          }}
        >
          <button
            type="button"
            className="btn btn-slate h-12 text-xl mt-2 sm:mb-4 mb-1"
            onClick={() => {
              window.electronAPI.startAutoLocating();
              return handleParticleLocator(MODE.AUTO);
            }}
          >
            {locationInProgress === false ? 'Auto-Start' : 'Auto-Stop'}
          </button>
          {foundParticles.length > 0 && (
            <>
              <div className="mb-9">
                <p className="text-xl mb-2">Found particles: </p>
                <ul className="list-none">{listOfItems(foundParticles)}</ul>
              </div>
              <button
                type="button"
                className="block ml-auto mr-auto btn btn-slate"
                onClick={() => postParticles({ [particleName]: false }, setParticles)}
              >
                Disable all
              </button>
            </>
          )}
          {/*{locationInProgress === true ? (window.electronAPI.getSources()) : null }*/}
        </ParticleLocatorWindow>
      )}
    </>
  );
}

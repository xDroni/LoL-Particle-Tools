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
        console.log(Date.now(), 'changed');
        setHashComparisonsResult((prev) => [...prev, COMPARISON_RESULT_STATE.DID_CHANGE]);
        setHashToCompare(hash);
        return await findParticle(split.entries1);
      }
      console.log(Date.now(), 'did not change');
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
      console.log('allFound');
      console.log(allFound);
      setHashComparisonsResult([]);
      if (allFound) {
        return stopLocating();
      }
      const foundParticle = entries[0][0];
      setFoundParticles((prev) => [...prev, foundParticle]);

      await postParticles(
        {
          ...particlesStateToRestore.current,
          ...foundParticles.reduce((prev, curr) => ({ ...prev, [curr]: false }), {}),
          [foundParticle]: false
        },
        setParticles
      );

      window.electronAPI.sendHashRequest();
      const firstHash = await getHash();
      setHashToCompare(() => firstHash);

      const onlyEnabled = await fetchParticles(setParticles, setReplayLoad, true);
      return findParticle(onlyEnabled);
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
    const currentParticles = await fetchParticles(setParticles, setReplayLoad);
    const enabledParticles = Object.entries(currentParticles).filter(([, state]) => Boolean(state));

    particlesStateToRestore.current = currentParticles;
    setParticleName(null);
    setFoundParticles([]);
    setLocationInProgress(true);

    if (mode === MODE.LEGACY) {
      return findParticle(enabledParticles);
    }

    window.electronAPI.startAutoLocating();

    // don't request because the first screenshot should come when user selects the area
    const firstHash = await getHash();
    setHashToCompare(() => firstHash);
    return findParticle(enabledParticles);
  }

  async function stopLocating() {
    if (mode === MODE.AUTO) {
      window.electronAPI.stopAutoLocating();
    }
    await postParticles(particlesStateToRestore.current, setParticles);

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
                  disabled={isLoading}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => handleDidChange(false)}
                  disabled={isLoading}
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
          <div className="flex flex-col w-24 mr-auto ml-auto">
            <button
              type="button"
              className="btn btn-slate h-12 text-xl mt-2 mb-2"
              onClick={() => {
                return handleParticleLocator(MODE.AUTO);
              }}
            >
              {locationInProgress === false ? 'Start' : 'Stop'}
            </button>
            <button
              type="button"
              className="btn btn-slate mb-2"
              disabled={locationInProgress || foundParticles.length === 0}
              onClick={() =>
                postParticles(
                  { ...foundParticles.reduce((prev, curr) => ({ ...prev, [curr]: false }), {}) },
                  setParticles
                )
              }
            >
              Disable all
            </button>
          </div>
          {/*todo*/}
          <p className="text-base mb-2">Found particles: </p>
          <div className="overflow-x-hidden overflow-y-auto h-12">
            <ul className="text-2xl list-none">{listOfItems(foundParticles)}</ul>
          </div>
        </ParticleLocatorWindow>
      )}
    </>
  );
}

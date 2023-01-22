import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import ParticleLocatorWindow from './ParticleLocatorWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { COMPARISON_RESULT_STATE, MODE } from './common/types';
import listOfItems from './common/listOfItems';

export default function ParticleLocator({ props }) {
  const {
    particles,
    setParticles,
    locationInProgress,
    setLocationInProgress,
    interval,
    setInterval,
    setReplayLoad
  } = props;
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [foundParticleLegacy, setFoundParticleLegacy] = useState([]);
  const [foundParticlesAuto, setFoundParticlesAuto] = useState([]);
  const [isNewWindow, setIsNewWindow] = useState(false);
  const [hashToCompare, setHashToCompare] = useState(null);
  const [hashComparisonsResult, setHashComparisonsResult] = useState([]);
  const [mode, setMode] = useState(MODE.AUTO);
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
      setFoundParticleLegacy([entries[0][0]]);
      return stopLocating();
    }

    if (entries.length === 1 && mode === MODE.AUTO) {
      const allFound = hashComparisonsResult.every(
        (result) => result === COMPARISON_RESULT_STATE.DID_NOT_CHANGE
      );
      setHashComparisonsResult([]);
      if (allFound) {
        return stopLocating();
      }
      const foundParticle = entries[0][0];
      setFoundParticlesAuto((prev) => [...prev, foundParticle]);

      await postParticles(
        {
          ...particlesStateToRestore.current,
          ...foundParticlesAuto.reduce((prev, curr) => ({ ...prev, [curr]: false }), {}),
          [foundParticle]: false
        },
        setParticles
      );

      window.electronAPI.sendHashRequest();
      const firstHash = await getHash();
      setHashToCompare(() => firstHash);

      const onlyEnabled = Object.entries(await fetchParticles(setParticles, setReplayLoad, true));
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
    setFoundParticleLegacy([]);
    setFoundParticlesAuto([]);
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

  function handleParticleChange(didChange) {
    if (locationInProgress === false) {
      return;
    }
    return didChange === true ? findParticle(split.entries1) : findParticle(split.entries2);
  }

  function handleModeChange() {
    setMode(mode === MODE.LEGACY ? MODE.AUTO : MODE.LEGACY);
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
      {isNewWindow && (
        <ParticleLocatorWindow
          handleDidChange={handleParticleChange}
          onClose={() => {
            setIsNewWindow(false);
            if (locationInProgress) void stopLocating();
          }}
        >
          <div className="mr-auto ml-auto flex flex-col w-28 gap-y-2 mt-2">
            <input
              onChange={handleModeChange}
              type="checkbox"
              className="fixed top-0 mt-2 right-0 mr-2"
            />
            <button
              type="button"
              className="btn btn-slate h-12 text-xl"
              onClick={() => handleParticleLocator(mode)}
            >
              {locationInProgress === false ? 'Start' : 'Stop'}
            </button>
            <button
              type="button"
              className="btn btn-slate"
              disabled={
                locationInProgress ||
                (mode === MODE.LEGACY && foundParticleLegacy.length === 0) ||
                (mode === MODE.AUTO && foundParticlesAuto.length === 0)
              }
              onClick={() =>
                mode === MODE.LEGACY
                  ? postParticles({ [foundParticleLegacy]: false }, setParticles)
                  : postParticles(
                      {
                        ...foundParticlesAuto.reduce(
                          (prev, curr) => ({ ...prev, [curr]: false }),
                          {}
                        )
                      },
                      setParticles
                    )
              }
            >
              {mode === MODE.LEGACY ? 'Disable found' : 'Disable all found'}
            </button>
            <p className="text-base text-center">
              {mode === MODE.LEGACY ? 'Found particle' : 'Found particles'}
            </p>
          </div>
          <div
            className={`no-scrollbar overflow-x-hidden ${
              mode === MODE.LEGACY ? 'h-12 justify-center' : 'h-44'
            } pt-1 flex flex-col items-center`}
          >
            {mode === MODE.LEGACY
              ? listOfItems(foundParticleLegacy, locationInProgress, particles, setParticles)
              : listOfItems(foundParticlesAuto, locationInProgress, particles, setParticles)}
          </div>
          {mode === MODE.LEGACY && (
            <div className="flex flex-col fixed bottom-6 w-full">
              <p className="mb-2 text-xl text-center">Did change?</p>
              <div className="flex gap-6 justify-center">
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => handleParticleChange(true)}
                  disabled={isLoading || !locationInProgress}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl disabled:bg-slate-800"
                  onClick={() => handleParticleChange(false)}
                  disabled={isLoading || !locationInProgress}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </ParticleLocatorWindow>
      )}
    </>
  );
}

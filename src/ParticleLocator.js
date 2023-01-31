import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import ParticleLocatorWindow from './ParticleLocatorWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { COMPARISON_RESULT_STATE, MODE, TOAST_NOTIFICATION_TYPES } from './common/types';
import listOfItems from './common/listOfItems';

export default function ParticleLocator({ props }) {
  const {
    particles,
    setParticles,
    locationInProgress,
    setLocationInProgress,
    interval,
    setInterval,
    replayLoad,
    setReplayLoad
  } = props;
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [foundParticles, setFoundParticles] = useState(new Set());
  const [isNewWindow, setIsNewWindow] = useState(false);
  const [hashToCompare, setHashToCompare] = useState(null);
  const [hashComparisonsResult, setHashComparisonsResult] = useState([]);
  const [mode, setMode] = useState(MODE.AUTO);
  const particlesStateToRestore = useRef([]);

  useEffect(() => {
    window.electronAPI.onClientNotFound(stopLocating);
  }, []);

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
        setHashComparisonsResult((prev) => [...prev, COMPARISON_RESULT_STATE.DID_CHANGE]);
        setHashToCompare(hash);
        return findParticle(split.entries1);
      }
      setHashComparisonsResult((prev) => [...prev, COMPARISON_RESULT_STATE.DID_NOT_CHANGE]);
      return findParticle(split.entries2);
    });
  }, [split, setParticles]);

  async function getHash() {
    return window.electronAPI.waitForHashResponse();
  }

  async function findParticle(entries) {
    if (entries.length === 0) {
      return stopLocating();
    }

    if (entries.length === 1 && mode === MODE.LEGACY) {
      const foundParticle = entries[0][0];
      setFoundParticles((prev) => new Set([...prev, foundParticle]));
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
      setFoundParticles((prev) => new Set([...prev, foundParticle]));

      await postParticles(
        {
          ...particlesStateToRestore.current,
          ...Array.from(foundParticles).reduce((prev, curr) => ({ ...prev, [curr]: false }), {}),
          [foundParticle]: false
        },
        setParticles
      );

      window.electronAPI.sendHashRequest();
      const firstHash = await getHash();
      setHashToCompare(() => firstHash);

      const onlyEnabled = Object.entries(
        await fetchParticles(setParticles, replayLoad, setReplayLoad, true)
      );
      return findParticle(onlyEnabled);
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2)
    });
  }

  async function handleParticleLocator(mode) {
    if (replayLoad === true) {
      return window.electronAPI.sendToastNotification(
        TOAST_NOTIFICATION_TYPES.ERROR,
        "Couldn't find the opened replay."
      );
    }
    if (locationInProgress === true) {
      setInterval(autoFetch(setParticles, replayLoad, setReplayLoad, 7000));
      return stopLocating();
    }

    clearInterval(interval);
    const currentParticles = await fetchParticles(setParticles, replayLoad, setReplayLoad);
    const enabledParticles = Object.entries(currentParticles).filter(([, state]) => Boolean(state));

    particlesStateToRestore.current = currentParticles;
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
    setInterval(autoFetch(setParticles, replayLoad, setReplayLoad, 7000));
  }

  function handleParticleChange(didChange) {
    if (locationInProgress === false) {
      return;
    }
    return didChange === true ? findParticle(split.entries1) : findParticle(split.entries2);
  }

  function handleModeChange() {
    return setMode(mode === MODE.LEGACY ? MODE.AUTO : MODE.LEGACY);
  }

  function clearFoundParticles() {
    return setFoundParticles(new Set());
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-slate btn-responsive sm:mb-4 mb-1 block mr-auto ml-auto  "
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
          <div className="mr-auto ml-auto flex flex-col w-28 gap-y-1 mt-2">
            <label
              htmlFor="ModeToggle"
              className="fixed top-0 mt-2 right-0 mr-2 inline-flex items-center space-x-1 cursor-pointer dark:text-slate-100"
            >
              <span className="text-xxs">Legacy</span>
              <span className="relative">
                <input
                  id="ModeToggle"
                  type="checkbox"
                  className="hidden peer"
                  checked={mode === MODE.AUTO}
                  onChange={handleModeChange}
                />
                <div className="w-7 h-3 rounded-full shadow-inner dark:bg-slate-600 peer-checked:dark:bg-green-700"></div>
                <div className="absolute -inset-y-1 left-0 w-3 h-3 mx-0 my-1 rounded-full transition duration-300 peer-checked:right-0 peer-checked:left-auto dark:bg-slate-800"></div>
              </span>
              <span className="text-xxs">Auto</span>
            </label>
            <button
              type="button"
              className="btn btn-slate text-base"
              onClick={() => handleParticleLocator(mode)}
            >
              {locationInProgress === false ? 'Start' : 'Stop'}
            </button>
            <button
              type="button"
              className="btn btn-slate"
              disabled={locationInProgress || foundParticles.size === 0}
              onClick={() =>
                postParticles(
                  {
                    ...Array.from(foundParticles).reduce(
                      (prev, curr) => ({ ...prev, [curr]: false }),
                      {}
                    )
                  },
                  setParticles
                )
              }
            >
              Disable all found
            </button>
            <button type="button" className="btn btn-slate" onClick={clearFoundParticles}>
              Clear the list
            </button>
            <p className="text-base text-center">Found particles</p>
          </div>
          <div
            className={`scrollbar overflow-x-hidden ${
              mode === MODE.LEGACY ? 'h-16' : 'h-44'
            } pt-1 flex flex-col items-center scrollbar-gutter-enable`}
          >
            {listOfItems(Array.from(foundParticles), locationInProgress, particles, setParticles)}
          </div>
          {mode === MODE.LEGACY && (
            <div className="flex flex-col fixed bottom-2 w-full">
              <p className="mb-2 text-xl text-center">Did change?</p>
              <div className="flex gap-6 justify-center">
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl"
                  onClick={() => handleParticleChange(true)}
                  disabled={isLoading || !locationInProgress}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-slate w-16 h-16 text-xl"
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

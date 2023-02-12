import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { LoadingContext, ParticlesContext } from './AppContext';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import fetchRenderProperties from './common/fetchRenderProperties';
import listOfItems from './common/listOfItems';
import postParticles from './common/postParticles';
import postRenderProperties from './common/postRenderProperties';
import { COMPARISON_RESULT_STATE, MODE } from './common/types';
import config from './config.json';
import ParticleLocatorWindow from './ParticleLocatorWindow';

const electronAPI = window.electronAPI;
const TOAST_NOTIFICATION_TYPES = window.TOAST_NOTIFICATION_TYPES;

export default function ParticleLocator({ props }) {
  const { locationInProgress, setLocationInProgress } = props;
  const { interval, setInterval, replayLoad, setReplayLoad } = useContext(LoadingContext);
  const { particles, setParticles } = useContext(ParticlesContext);
  const [split, setSplit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [foundParticles, setFoundParticles] = useState(new Set());
  const [isNewWindow, setIsNewWindow] = useState(false);
  const [imageSrcToCompare, setImageSrcToCompare] = useState(null);
  const [imageSrcComparisonResults, setImageSrcComparisonResults] = useState([]);
  const [mode, setMode] = useState(MODE.AUTO);
  const particlesStateToRestore = useRef(null);
  const renderPropertiesToRestore = useRef(null);

  useEffect(() => {
    electronAPI.onClientNotFound(stopLocating);
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

      electronAPI.sendImageSrcRequest();
      const imageSource = await getImageSrc();
      if (imageSource !== imageSrcToCompare) {
        setImageSrcComparisonResults((prev) => [...prev, COMPARISON_RESULT_STATE.DID_CHANGE]);
        setImageSrcToCompare(imageSource);
        return findParticle(split.entries1);
      }
      setImageSrcComparisonResults((prev) => [...prev, COMPARISON_RESULT_STATE.DID_NOT_CHANGE]);
      return findParticle(split.entries2);
    });
  }, [split, setParticles]);

  async function getImageSrc() {
    return electronAPI.waitForImageSrcResponse();
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
      const allFound = imageSrcComparisonResults.every(
        (result) => result === COMPARISON_RESULT_STATE.DID_NOT_CHANGE
      );
      setImageSrcComparisonResults([]);
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

      electronAPI.sendImageSrcRequest();

      // actually not the first source of the image, but the first in this circulation
      const firstImageSrc = await getImageSrc();
      setImageSrcToCompare(() => firstImageSrc);

      const onlyActiveParticles = Object.entries(
        await fetchParticles(setParticles, replayLoad, setReplayLoad, true)
      );
      return findParticle(onlyActiveParticles);
    }

    setSplit({
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2)
    });
  }

  async function handleParticleLocator(mode) {
    if (locationInProgress === true) {
      setInterval(autoFetch(setParticles, replayLoad, setReplayLoad, 7000));
      return stopLocating();
    }

    if (replayLoad === true) {
      return electronAPI.sendToastNotification(TOAST_NOTIFICATION_TYPES.ERROR, 'Replay not found');
    }

    clearInterval(interval);
    const currentParticles = await fetchParticles(setParticles, replayLoad, setReplayLoad);
    const activeParticles = Object.entries(currentParticles).filter(([, state]) => Boolean(state));

    particlesStateToRestore.current = currentParticles;
    setLocationInProgress(true);

    try {
      const currentRenderProperties = await fetchRenderProperties(replayLoad, setReplayLoad);
      renderPropertiesToRestore.current = currentRenderProperties;

      const preparedRenderProperties = prepareRequiredRenderProperties(
        currentRenderProperties,
        false
      );

      // needed to switch off interface, outlines etc. which may affect the results
      await postRenderProperties(preparedRenderProperties);
    } catch (e) {
      console.error(e);
    }

    if (mode === MODE.LEGACY) {
      return findParticle(activeParticles);
    }

    electronAPI.startAutoLocating();

    // don't request because the first screenshot should come when user selects the area
    const firstImageSrc = await getImageSrc();
    setImageSrcToCompare(() => firstImageSrc);
    return findParticle(activeParticles);
  }

  async function stopLocating() {
    if (mode === MODE.AUTO) {
      electronAPI.stopAutoLocating();
    }
    await postParticles(particlesStateToRestore.current, setParticles);

    await postRenderProperties(
      prepareRequiredRenderProperties(renderPropertiesToRestore.current, true)
    );

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

  function prepareRequiredRenderProperties(properties, restore) {
    const requiredProperties = config.requiredRenderProperties;
    return Object.entries(properties).reduce((result, [key, value]) => {
      if (requiredProperties.includes(key)) {
        return { ...result, [key]: restore === true ? value : false };
      }
      return result;
    }, {});
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-slate btn-responsive mb-4 mr-auto ml-auto block"
        onClick={() => setIsNewWindow(true)}
      >
        <FontAwesomeIcon className="initial md:mr-1" icon="fa-solid fa-crosshairs" size="lg" />
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
          <div className="mr-auto ml-auto mt-2 flex w-28 flex-col gap-y-1">
            <label
              htmlFor="ModeToggle"
              className={`${
                locationInProgress ? 'opacity-40' : ''
              } fixed top-0 right-0 mt-2 mr-2 inline-flex cursor-pointer items-center space-x-1 dark:text-slate-100`}
            >
              <span className="text-xxs">Legacy</span>
              <span className="relative">
                <input
                  id="ModeToggle"
                  type="checkbox"
                  className="peer hidden"
                  checked={mode === MODE.AUTO}
                  onChange={handleModeChange}
                  disabled={locationInProgress}
                />
                <div className="h-3 w-7 rounded-full shadow-inner dark:bg-slate-600 peer-checked:dark:bg-green-700"></div>
                <div className="absolute -inset-y-1 left-0 mx-0 my-1 h-3 w-3 rounded-full transition duration-300 peer-checked:right-0 peer-checked:left-auto dark:bg-slate-800"></div>
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
              className="btn btn-slate text-xxs"
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
              Deactivate all found
            </button>
            <button type="button" className="btn btn-slate" onClick={clearFoundParticles}>
              Clear the list
            </button>
            <p className="text-center text-base">Found particles</p>
          </div>
          <div
            className={`scrollbar overflow-x-hidden ${
              mode === MODE.LEGACY ? 'h-16' : 'h-44'
            } scrollbar-gutter-enable flex flex-col items-center pt-1`}
          >
            {listOfItems(Array.from(foundParticles), locationInProgress, particles, setParticles)}
          </div>
          {mode === MODE.LEGACY && (
            <div className="fixed bottom-2 flex w-full flex-col">
              <p className="mb-2 text-center text-xl">Did change?</p>
              <div className="flex justify-center gap-6">
                <button
                  type="button"
                  className="btn btn-slate h-16 w-16 text-xl"
                  onClick={() => handleParticleChange(true)}
                  disabled={isLoading || !locationInProgress}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-slate h-16 w-16 text-xl"
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

import React, { useContext, useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import ParticleLocatorWindow from './ParticleLocatorWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { COMPARISON_RESULT_STATE, MODE, TOAST_NOTIFICATION_TYPES } from './common/types';
import listOfItems from './common/listOfItems';
import fetchRenderProperties from './common/fetchRenderProperties';
import postRenderProperties from './common/postRenderProperties';
import config from './config.json';
import { LoadingContext, ParticlesContext } from './AppContext';

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

      window.electronAPI.sendImageSrcRequest();
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
    return window.electronAPI.waitForImageSrcResponse();
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

      window.electronAPI.sendImageSrcRequest();

      // actually not the first source of the image, but the first in this circulation
      const firstImageSrc = await getImageSrc();
      setImageSrcToCompare(() => firstImageSrc);

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
    if (locationInProgress === true) {
      setInterval(autoFetch(setParticles, replayLoad, setReplayLoad, 7000));
      return stopLocating();
    }

    if (replayLoad === true) {
      return window.electronAPI.sendToastNotification(
        TOAST_NOTIFICATION_TYPES.ERROR,
        "Couldn't find the opened replay."
      );
    }

    clearInterval(interval);
    const currentParticles = await fetchParticles(setParticles, replayLoad, setReplayLoad);
    const enabledParticles = Object.entries(currentParticles).filter(([, state]) => Boolean(state));

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
      return findParticle(enabledParticles);
    }

    window.electronAPI.startAutoLocating();

    // don't request because the first screenshot should come when user selects the area
    const firstImageSrc = await getImageSrc();
    setImageSrcToCompare(() => firstImageSrc);
    return findParticle(enabledParticles);
  }

  async function stopLocating() {
    if (mode === MODE.AUTO) {
      window.electronAPI.stopAutoLocating();
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
              className={`${
                locationInProgress ? 'opacity-40' : ''
              } fixed top-0 mt-2 right-0 mr-2 inline-flex items-center space-x-1 cursor-pointer dark:text-slate-100`}
            >
              <span className="text-xxs">Legacy</span>
              <span className="relative">
                <input
                  id="ModeToggle"
                  type="checkbox"
                  className="hidden peer"
                  checked={mode === MODE.AUTO}
                  onChange={handleModeChange}
                  disabled={locationInProgress}
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

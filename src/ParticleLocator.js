import React, { useEffect, useRef, useState } from 'react';
import postParticles from './common/postParticles';
import ParticleLocatorWindow from './ParticleLocatorWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles, { autoFetch } from './common/fetchParticles';
import { MODE } from './common/types';

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

      // await new Promise(resolve => setTimeout(resolve, 0))

      window.electronAPI.sendHashRequest();
      const hash = await getHash();
      console.log('hash', hash);
      if (hash !== hashToCompare) {
        console.log(Date.now(), 'changed!');
        setHashToCompare(hash);
        return await findParticle(split.entries1);
      }
      console.log(Date.now(), 'didnt change');
      return await findParticle(split.entries2);
    });
  }, [split, setParticles]);

  async function getHash() {
    return await window.electronAPI.waitForHashResponse();
  }

  async function findParticle(entries) {
    if (entries.length <= 1) {
      setInterval(autoFetch(setParticles, setReplayLoad, 10000));
      return stopLocating(entries);
    }

    console.log('setting split');
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
    const fetchedParticles = await fetchParticles(setParticles, setReplayLoad);
    particlesStateToRestore.current = fetchedParticles;
    setParticleName(null);
    setLocationInProgress(true);
    const enabledParticles = Object.entries(fetchedParticles).filter(([, state]) => Boolean(state));

    if (mode === MODE.LEGACY) {
      return findParticle(enabledParticles);
    }

    // console.log('sending hash request');

    // dont request because the first hash should come when user selects the area
    // window.electronAPI.sendHashRequest();
    const firstHash = await getHash();

    console.log('#firstHasth', firstHash);

    setHashToCompare(() => firstHash);
    return findParticle(enabledParticles, MODE.AUTO);
  }

  async function stopLocating(entries) {
    // await postParticles(particlesStateToRestore.current, setParticles);
    // setParticles(particlesStateToRestore.current);
    if (entries !== undefined && entries.length > 0) {
      console.log(entries);
      setParticleName(entries[0][0]);
    }
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
          <div className="">
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
          </div>
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
          <div className="">
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
            {/*{locationInProgress === true ? (window.electronAPI.getSources()) : null }*/}
          </div>
        </ParticleLocatorWindow>
      )}
    </>
  );
}

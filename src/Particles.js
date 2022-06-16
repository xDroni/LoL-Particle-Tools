import React, { useDeferredValue, useState } from 'react';
import ParticleLocator from './ParticleLocator';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import postParticles from './common/postParticles';
import fetchParticles from './common/fetchParticles';

export default function Particles({
  particles,
  setParticles,
  interval,
  setInterval,
  setReplayLoad
}) {
  const [locationInProgress, setLocationInProgress] = useState(false);
  const [selectedEnabledParticles, setSelectedEnabledParticles] = useState([]);
  const [selectedDisabledParticles, setSelectedDisabledParticles] = useState([]);

  const particlesByState = Object.entries(particles).reduce(
    (prev, curr) => ({
      enabled: curr[1] ? [...prev.enabled, curr[0]] : [...prev.enabled],
      disabled: !curr[1] ? [...prev.disabled, curr[0]] : [...prev.disabled]
    }),
    { enabled: [], disabled: [] }
  );

  const [enabledParticlesFilter, setEnabledParticlesFilter] = useState('');
  const [disabledParticlesFilter, setDisabledParticlesFilter] = useState('');
  const [fileName, setFileName] = useState('');
  const enabledParticlesDeferredFilter = useDeferredValue(enabledParticlesFilter);
  const disabledParticlesDeferredFilter = useDeferredValue(disabledParticlesFilter);

  const enabledParticlesFiltered = particlesByState.enabled.filter((p) => {
    const regex = new RegExp(enabledParticlesDeferredFilter, 'i');
    return enabledParticlesDeferredFilter === ''
      ? true
      : regex.test(p) || regex.test(p.replaceAll('_', ''));
  });

  const disabledParticlesFiltered = particlesByState.disabled.filter((p) => {
    const regex = new RegExp(disabledParticlesDeferredFilter, 'i');
    return disabledParticlesDeferredFilter === ''
      ? true
      : regex.test(p) || regex.test(p.replaceAll('_', ''));
  });

  function handleEnabledParticlesFilterChange(event) {
    setEnabledParticlesFilter(event.target.value);
  }

  function handleDisabledParticlesFilterChange(event) {
    setDisabledParticlesFilter(event.target.value);
  }

  function handleEnabledParticlesChange(event) {
    const selectedOptions = event.target.selectedOptions;
    const values = Array.from(selectedOptions).map(({ value }) => value);
    setSelectedEnabledParticles(values);
  }

  function handleDisabledParticlesChange(event) {
    const selectedOptions = event.target.selectedOptions;
    const values = Array.from(selectedOptions).map(({ value }) => value);
    setSelectedDisabledParticles(values);
  }

  function makeJSON(particles, state) {
    return particles.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: state
      }),
      {}
    );
  }

  function disableSelectedParticles() {
    if (selectedEnabledParticles.length === 0) {
      return;
    }
    const json = makeJSON(selectedEnabledParticles, false);
    postParticles(json, setParticles);
  }

  function enableSelectedParticles() {
    if (selectedDisabledParticles.length === 0) {
      return;
    }
    const json = makeJSON(selectedDisabledParticles, true);
    postParticles(json, setParticles);
  }

  function handleSaveFile() {
    const data = particlesByState.disabled.reduce((prev, curr) => {
      return prev + curr + '\n';
    }, '');
    const blob = new Blob([data]);
    saveAs(blob, `${fileName}`);
    setFileName('');
  }

  function handleFile() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = () => {
      let file = input.files[0];
      if (file === undefined || file.name.split('.').pop() !== 'txt') return;
      const fileReader = new FileReader();
      fileReader.onload = (f) => {
        const particlesToDisable = f.target.result.toString();
        const particlesToDisableJSON = particlesToDisable.split('\n').reduce(
          (prev, curr) => ({
            ...prev,
            ...(curr.trim().length ? { [curr.trim()]: false } : {})
          }),
          {}
        );
        postParticles(particlesToDisableJSON, setParticles);
      };
      fileReader.readAsText(file, 'UTF-8');
    };
    input.click();
  }

  return (
    <div className="flex gap-2 lg:gap-8 justify-center">
      <div className="w-96 text-center">
        <span className="block sm:mb-2 mb-0 uppercase">Enabled particles</span>
        <div className="flex">
          <select
            multiple
            className="h-[70vh] text-xs lg:text-base bg-slate-800 w-full rounded-xl overflow-x-hidden no-scrollbar sm:mb-4 mb-1 disabled:bg-slate-800"
            disabled={locationInProgress}
            onChange={handleEnabledParticlesChange}
          >
            {enabledParticlesFiltered.map((particleName) => {
              return (
                <option
                  key={particleName}
                  value={particleName}
                  className="hover:bg-slate-700 rounded-xl"
                >
                  {particleName}
                </option>
              );
            })}
          </select>
          <button
            className="btn btn-slate h-8 lg:h-16 mt-auto mb-auto"
            onClick={disableSelectedParticles}
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
          </button>
        </div>

        <input
          value={enabledParticlesFilter}
          onChange={handleEnabledParticlesFilterChange}
          type="text"
          className="w-3/4 text-xs lg:text-base ml-auto mr-auto block bg-slate-800 placeholder-cyan-100 sm:mb-4 mb-1"
          placeholder="Filter"
        />
        <ParticleLocator
          setParticles={setParticles}
          locationInProgress={locationInProgress}
          setLocationInProgress={setLocationInProgress}
          interval={interval}
          setInterval={setInterval}
          setReplayLoad={setReplayLoad}
        />
      </div>
      <div className="w-96 text-center">
        <span className="block sm:mb-2 mb-0 uppercase">Disabled particles</span>
        <div className="flex">
          <button
            className="btn btn-slate h-8 lg:h-16 mt-auto mb-auto"
            onClick={enableSelectedParticles}
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
          </button>
          <select
            multiple
            className="h-[70vh] text-xs lg:text-base bg-slate-800 w-full rounded-xl overflow-x-hidden no-scrollbar sm:mb-4 mb-1 disabled:bg-slate-800"
            disabled={locationInProgress}
            onChange={handleDisabledParticlesChange}
          >
            {disabledParticlesFiltered.map((particleName) => {
              return (
                <option
                  key={particleName}
                  value={particleName}
                  className="hover:bg-slate-700 rounded-xl"
                >
                  {particleName}
                </option>
              );
            })}
          </select>
        </div>

        <input
          value={disabledParticlesFilter}
          onChange={handleDisabledParticlesFilterChange}
          type="text"
          className="w-3/4 text-xs lg:text-base ml-auto mr-auto block bg-slate-800 placeholder-cyan-100 sm:mb-4 mb-1"
          placeholder="Filter"
        />

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            className="block btn btn-slate btn-responsive sm:mb-4 mb-1"
            onClick={handleSaveFile}
          >
            <FontAwesomeIcon
              className="mr-1 initial"
              icon="fa-solid fa-file-arrow-down"
              size="lg"
            />
            Save to file
          </button>
          <button className="btn btn-slate btn-responsive block  sm:mb-4 mb-1" onClick={handleFile}>
            <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-file-arrow-up" size="lg" />
            Import data
          </button>
        </div>

        <button
          className="btn btn-slate btn-responsive"
          onClick={() => fetchParticles(setParticles)}
        >
          <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-arrows-rotate" />
          Refresh
        </button>
      </div>
    </div>
  );
}

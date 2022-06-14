import React, { useDeferredValue, useState } from 'react';
import DisableParticles from './DisableParticles';
import ParticleLocator from './ParticleLocator';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import postParticles from './common/postParticles';

export default function Particles({ particles, setParticles, interval, setInterval }) {
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

  const [filter, setFilter] = useState('');
  const [fileName, setFileName] = useState('');
  const deferredFilter = useDeferredValue(filter);

  const filtered = particlesByState.enabled.filter((p) => {
    const regex = new RegExp(deferredFilter, 'i');
    return deferredFilter === '' ? true : regex.test(p) || regex.test(p.replaceAll('_', ''));
  });

  function handleFilterChange(event) {
    setFilter(event.target.value);
  }

  function handleFileNameChange(event) {
    setFileName(event.target.value);
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

  return (
    <div className="flex gap-2 lg:gap-8 justify-center">
      <div className="w-96 text-center">
        <span className="block sm:mb-2 mb-0 uppercase">Enabled particles</span>
        <div className="flex">
          <select
            multiple
            className="h-[20vh] sm:h-[40vh] md:h-[70vh] text-xs lg:text-base bg-slate-800 w-full rounded-xl overflow-auto no-scrollbar mb-4 disabled:bg-slate-800"
            disabled={locationInProgress}
            onChange={handleEnabledParticlesChange}>
            {filtered.map((particleName) => {
              return (
                <option
                  key={particleName}
                  value={particleName}
                  className="hover:bg-slate-700 rounded-xl">
                  {particleName}
                </option>
              );
            })}
          </select>
          <button
            className="btn btn-slate h-8 lg:h-16 mt-auto mb-auto"
            onClick={disableSelectedParticles}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
          </button>
        </div>

        <input
          value={filter}
          onChange={handleFilterChange}
          type="text"
          className="w-3/4 text-xs lg:text-base ml-auto mr-auto block bg-slate-800 placeholder-cyan-100 mb-4"
          placeholder="Filter"
        />
        <ParticleLocator
          setParticles={setParticles}
          locationInProgress={locationInProgress}
          setLocationInProgress={setLocationInProgress}
          interval={interval}
          setInterval={setInterval}
        />
      </div>
      <div className="w-96 text-center">
        <span className="block sm:mb-2 mb-0 uppercase">Disabled particles</span>
        <div className="flex">
          <button
            className="btn btn-slate h-8 lg:h-16 mt-auto mb-auto"
            onClick={enableSelectedParticles}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
          </button>
          <select
            multiple
            className="h-[20vh] sm:h-[40vh] md:h-[70vh] text-xs lg:text-base bg-slate-800 w-full rounded-xl overflow-auto no-scrollbar mb-4 disabled:bg-slate-800"
            disabled={locationInProgress}
            onChange={handleDisabledParticlesChange}>
            {particlesByState.disabled.map((particleName) => {
              return (
                <option
                  key={particleName}
                  value={particleName}
                  className="hover:bg-slate-700 rounded-xl">
                  {particleName}
                </option>
              );
            })}
          </select>
        </div>

        <input
          id="saveFile"
          value={fileName}
          onChange={handleFileNameChange}
          type="text"
          className="w-3/4 text-xs lg:text-base ml-auto mr-auto block bg-slate-800 placeholder-cyan-100 mb-4"
          placeholder="File name"
        />
        <button
          type="button"
          className="block ml-auto mr-auto btn btn-slate btn-responsive mb-4"
          onClick={handleSaveFile}>
          <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-file-arrow-down" size="lg" />{' '}
          Save to file
        </button>
      </div>
      <DisableParticles setParticles={setParticles} />
    </div>
  );
}

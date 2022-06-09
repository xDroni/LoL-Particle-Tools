import React, { useDeferredValue, useState } from 'react';
import DisableParticles from './DisableParticles';
import ParticleLocator from './ParticleLocator';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Particles({ particles, setParticles }) {
  const [locationInProgress, setLocationInProgress] = useState(false);

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

  function handleSaveFile() {
    const data = particlesByState.disabled.reduce((prev, curr) => {
      return prev + curr + '\n';
    }, '');
    const blob = new Blob([data]);
    saveAs(blob, `${fileName}`);
    setFileName('');
  }

  return (
    <div className="flex justify-center items-center">
      <div className="w-1/3 text-center">
        <span className="block mb-2 uppercase">Enabled particles</span>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar h-[38rem] mb-4 disabled:bg-slate-800"
          disabled={locationInProgress}
        >
          {filtered.map((particleName) => {
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
        <input
          value={filter}
          onChange={handleFilterChange}
          type="text"
          className="w-1/2 ml-auto mr-auto block bg-slate-800 placeholder-cyan-100 mb-4"
          placeholder="Filter"
        />
        <ParticleLocator
          particles={particles}
          setParticles={setParticles}
          locationInProgress={locationInProgress}
          setLocationInProgress={setLocationInProgress}
        />
      </div>
      <div className="w-1/3 text-center">
        <span className="block mb-2 uppercase">Disabled particles</span>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar h-[38rem] mb-4 disabled:bg-slate-800"
          disabled={locationInProgress}
        >
          {particlesByState.disabled.map((particleName) => {
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
        <input
          id="saveFile"
          value={fileName}
          onChange={handleFileNameChange}
          type="text"
          className="w-1/2 ml-auto mr-auto block bg-slate-800 placeholder-cyan-100 mb-4"
          placeholder="File name"
        />
        <button
          type="button"
          className="block ml-auto mr-auto btn btn-slate mb-4"
          onClick={handleSaveFile}
        >
          <FontAwesomeIcon className="mr-1" icon="fa-solid fa-file-arrow-down" size="lg" /> Save to
          file
        </button>
      </div>
      <DisableParticles setParticles={setParticles} />
    </div>
  );
}

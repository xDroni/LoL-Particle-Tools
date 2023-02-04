import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { saveAs } from 'file-saver';
import React, { useContext, useDeferredValue, useState } from 'react';

import { LoadingContext, ParticlesContext } from './AppContext';
import fetchParticles from './common/fetchParticles';
import postParticles from './common/postParticles';
import { TOAST_NOTIFICATION_TYPES } from './common/types';
import ParticleLocator from './ParticleLocator';

export default function Particles() {
  const { replayLoad, setReplayLoad } = useContext(LoadingContext);
  const { particles, setParticles } = useContext(ParticlesContext);
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

  function handleExportFile() {
    const data = particlesByState.disabled.reduce((prev, curr) => {
      return prev + curr + '\n';
    }, '');
    const blob = new Blob([data]);
    saveAs(blob, `${fileName}`);
    setFileName('');
  }

  function handleImportFile() {
    let input = document.createElement('input');
    let errorOccurred = false;
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = () => {
      let file = input.files[0];
      if (file === undefined || file.name.split('.').pop() !== 'txt') return;
      const fileReader = new FileReader();
      fileReader.onload = (f) => {
        const particlesToDisable = f.target.result.toString();
        const particlesToDisableJSON = particlesToDisable.split('\n').reduce((prev, curr) => {
          const trimmed = curr.trim();
          if (trimmed.length === 0) {
            return prev;
          }
          if (!/^[0-9A-Za-z_-]+$/.test(trimmed)) {
            errorOccurred = true;
            return prev;
          }
          /* typo, there is space at the end of these 2 particle names,
             so we need to add that space to match the name in API */
          if (
            trimmed === 'SRUAP_Order_Nexus_Idle1_sound' ||
            trimmed === 'SRUAP_Order_Nexus_Spawn_sound'
          ) {
            return {
              ...prev,
              ...{ [trimmed + ' ']: false }
            };
          }
          return {
            ...prev,
            ...{ [curr.trim()]: false }
          };
        }, {});
        postParticles(particlesToDisableJSON, setParticles);
        if (errorOccurred === true) {
          return window.electronAPI.sendToastNotification(
            TOAST_NOTIFICATION_TYPES.WARN,
            'Not all of the particle names have been imported due to not supported characters. Validate the file.'
          );
        }
      };
      fileReader.readAsText(file, 'UTF-8');
    };
    input.click();
  }

  return (
    <div className="mt-4 flex justify-center gap-2 lg:gap-8">
      <div className="w-96 text-center">
        <span className="mb-0 block uppercase sm:mb-2">Enabled particles</span>
        <div className="flex">
          <select
            multiple
            className="particle-list particle-list-scrollbar"
            disabled={locationInProgress}
            onChange={handleEnabledParticlesChange}
          >
            {enabledParticlesFiltered.map((particleName) => {
              return (
                <option
                  className="rounded-xl hover:bg-slate-700"
                  key={particleName}
                  value={particleName}
                >
                  {particleName}
                </option>
              );
            })}
          </select>
          <button className="btn btn-r btn-slate -ml-1 h-[70vh]" onClick={disableSelectedParticles}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
          </button>
        </div>

        <input
          type="text"
          className="filter-button"
          placeholder="Filter"
          value={enabledParticlesFilter}
          onChange={handleEnabledParticlesFilterChange}
        />
        <ParticleLocator props={{ locationInProgress, setLocationInProgress }} />
      </div>
      <div className="w-96 text-center">
        <span className="mb-0 block uppercase sm:mb-2">Disabled particles</span>
        <div className="flex">
          <button className="btn btn-l btn-slate -mr-1 h-[70vh]" onClick={enableSelectedParticles}>
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
          </button>
          <select
            multiple
            className="particle-list particle-list-scrollbar"
            disabled={locationInProgress}
            onChange={handleDisabledParticlesChange}
          >
            {disabledParticlesFiltered.map((particleName) => {
              return (
                <option
                  className="rounded-xl hover:bg-slate-700"
                  key={particleName}
                  value={particleName}
                >
                  {particleName}
                </option>
              );
            })}
          </select>
        </div>

        <input
          type="text"
          className="filter-button"
          placeholder="Filter"
          value={disabledParticlesFilter}
          onChange={handleDisabledParticlesFilterChange}
        />

        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="btn btn-slate btn-responsive mb-1 block sm:mb-4"
            onClick={handleExportFile}
          >
            <FontAwesomeIcon
              className="initial mr-1"
              icon="fa-solid fa-file-arrow-down"
              size="lg"
            />
            Save to file
          </button>
          <button
            className="btn btn-slate btn-responsive mb-1  block sm:mb-4"
            onClick={handleImportFile}
          >
            <FontAwesomeIcon className="initial mr-1" icon="fa-solid fa-file-arrow-up" size="lg" />
            Import data
          </button>
        </div>

        <button
          className="btn btn-slate btn-responsive"
          onClick={() => fetchParticles(setParticles, replayLoad, setReplayLoad)}
        >
          <FontAwesomeIcon className="initial mr-1" icon="fa-solid fa-arrows-rotate" />
          Refresh
        </button>
      </div>
    </div>
  );
}

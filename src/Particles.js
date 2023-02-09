import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { saveAs } from 'file-saver';
import React, { useContext, useDeferredValue, useEffect, useState } from 'react';

import { LoadingContext, ParticlesContext } from './AppContext';
import fetchParticles from './common/fetchParticles';
import postParticles from './common/postParticles';
import ParticleLocator from './ParticleLocator';

const electronAPI = window.electronAPI;
const TOAST_NOTIFICATION_TYPES = window.TOAST_NOTIFICATION_TYPES;

export default function Particles() {
  const { replayLoad, setReplayLoad } = useContext(LoadingContext);
  const { particles, setParticles, particlesByState, setParticlesByState } =
    useContext(ParticlesContext);
  const [locationInProgress, setLocationInProgress] = useState(false);
  const [selectedActiveParticles, setSelectedActiveParticles] = useState([]);
  const [selectedInactiveParticles, setSelectedInactiveParticles] = useState([]);

  useEffect(() => {
    setParticlesByState(
      Object.entries(particles).reduce(
        (prev, curr) => ({
          active: curr[1] ? [...prev.active, curr[0]] : [...prev.active],
          inactive: !curr[1] ? [...prev.inactive, curr[0]] : [...prev.inactive]
        }),
        { active: [], inactive: [] }
      )
    );
  }, [particles, setParticlesByState]);

  const [activeParticlesFilter, setActiveParticlesFilter] = useState('');
  const [inactiveParticlesFilter, setInactiveParticlesFilter] = useState('');
  const [fileName, setFileName] = useState('');
  const activeParticlesDeferredFilter = useDeferredValue(activeParticlesFilter);
  const inactiveParticlesDeferredFilter = useDeferredValue(inactiveParticlesFilter);

  const activeParticlesFiltered = particlesByState.active.filter((p) => {
    const regex = new RegExp(activeParticlesDeferredFilter, 'i');
    return activeParticlesDeferredFilter === ''
      ? true
      : regex.test(p) || regex.test(p.replaceAll('_', ''));
  });

  const inactiveParticlesFiltered = particlesByState.inactive.filter((p) => {
    const regex = new RegExp(inactiveParticlesDeferredFilter, 'i');
    return inactiveParticlesDeferredFilter === ''
      ? true
      : regex.test(p) || regex.test(p.replaceAll('_', ''));
  });

  function handleActiveParticlesFilterChange(event) {
    setActiveParticlesFilter(event.target.value);
  }

  function handleInactiveParticlesFilterChange(event) {
    setInactiveParticlesFilter(event.target.value);
  }

  function handleActiveParticlesChange(event) {
    const selectedOptions = event.target.selectedOptions;
    const values = Array.from(selectedOptions).map(({ value }) => value);
    setSelectedActiveParticles(values);
  }

  function handleInactiveParticlesChange(event) {
    const selectedOptions = event.target.selectedOptions;
    const values = Array.from(selectedOptions).map(({ value }) => value);
    setSelectedInactiveParticles(values);
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

  function deactivateSelectedParticles() {
    if (selectedActiveParticles.length === 0) {
      return;
    }
    const json = makeJSON(selectedActiveParticles, false);
    postParticles(json, setParticles);
  }

  function activateSelectedParticles() {
    if (selectedInactiveParticles.length === 0) {
      return;
    }
    const json = makeJSON(selectedInactiveParticles, true);
    postParticles(json, setParticles);
  }

  function handleExportFile() {
    const data = particlesByState.inactive.reduce((prev, curr) => {
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
        const particlesToDeactivate = f.target.result.toString();
        const particlesToDeactivateJSON = particlesToDeactivate.split('\n').reduce((prev, curr) => {
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
        postParticles(particlesToDeactivateJSON, setParticles);
        if (errorOccurred === true) {
          return electronAPI.sendToastNotification(
            TOAST_NOTIFICATION_TYPES.WARN,
            'Due to the unsupported characters, not all of the particles were imported. Validate the file.'
          );
        }
      };
      fileReader.readAsText(file, 'UTF-8');
    };
    input.click();
  }

  return (
    <div className="mt-10 flex justify-center gap-3 md:mt-4 md:gap-8">
      <div className="w-96 text-center">
        <span className="block hidden uppercase md:mb-2 md:block">Active particles</span>
        <div className="flex">
          <select
            multiple
            className="particle-list particle-list-scrollbar"
            disabled={locationInProgress || replayLoad}
            onChange={handleActiveParticlesChange}
          >
            {activeParticlesFiltered.map((particleName) => {
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
          <button
            className="btn btn-r btn-slate -ml-1 h-[70vh]"
            onClick={deactivateSelectedParticles}
            disabled={locationInProgress || replayLoad}
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
          </button>
        </div>

        <input
          type="text"
          className="filter-button"
          placeholder="Filter"
          value={activeParticlesFilter}
          onChange={handleActiveParticlesFilterChange}
        />
        <ParticleLocator props={{ locationInProgress, setLocationInProgress }} />
      </div>
      <div className="w-96 text-center">
        <span className="block hidden uppercase md:mb-2 md:block">Inactive particles</span>
        <div className="flex">
          <button
            className="btn btn-l btn-slate -mr-1 h-[70vh]"
            onClick={activateSelectedParticles}
            disabled={locationInProgress || replayLoad}
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
          </button>
          <select
            multiple
            className="particle-list particle-list-scrollbar"
            disabled={locationInProgress || replayLoad}
            onChange={handleInactiveParticlesChange}
          >
            {inactiveParticlesFiltered.map((particleName) => {
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
          value={inactiveParticlesFilter}
          onChange={handleInactiveParticlesFilterChange}
        />

        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="btn btn-slate btn-responsive block"
            onClick={handleExportFile}
          >
            <FontAwesomeIcon
              className="initial md:mr-1"
              icon="fa-solid fa-file-arrow-down"
              size="lg"
            />
            Save to file
          </button>
          <button className="btn btn-slate btn-responsive block" onClick={handleImportFile}>
            <FontAwesomeIcon
              className="initial md:mr-1"
              icon="fa-solid fa-file-arrow-up"
              size="lg"
            />
            Import data
          </button>
        </div>

        <button
          className="btn btn-slate btn-responsive mt-2 md:mt-4"
          onClick={() => fetchParticles(setParticles, replayLoad, setReplayLoad)}
        >
          <FontAwesomeIcon className="initial md:mr-1" icon="fa-solid fa-arrows-rotate" />
          Refresh
        </button>
      </div>
    </div>
  );
}

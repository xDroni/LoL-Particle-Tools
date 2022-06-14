import React, { useState } from 'react';
import postParticles from './common/postParticles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import fetchParticles from './common/fetchParticles';

export default function DisableParticles({ setParticles }) {
  const [particlesToDisable, setParticlesToDisable] = useState('');

  async function post() {
    const particlesToDisableJSON = particlesToDisable.split('\n').reduce(
      (prev, curr) => ({
        ...prev,
        ...(curr.trim().length ? { [curr.trim()]: false } : {})
      }),
      {}
    );

    await postParticles(particlesToDisableJSON, setParticles);
    setParticlesToDisable('');
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
        document.getElementById('particlesToDisable').value = f.target.result;
        setParticlesToDisable(f.target.result.toString());
      };
      fileReader.readAsText(file, 'UTF-8');
    };
    input.click();
  }

  return (
    <div className="w-96 text-center">
      <span className="block sm:mb-2 mb-0 uppercase">List to disable</span>
      <textarea
        id="particlesToDisable"
        className="bg-slate-800 h-[40vh] w-3/4 rounded-xl overflow-auto no-scrollbar block ml-auto mr-auto sm:mb-4 mb-1"
        onChange={(e) => setParticlesToDisable(e.target.value)}
        value={particlesToDisable}></textarea>
      <button
        className="btn btn-slate btn-responsive block ml-auto mr-auto sm:mb-4 mb-1"
        onClick={() => post()}>
        <FontAwesomeIcon
          className="mr-1 lg:text-base initial"
          icon="fa-solid fa-eye-slash"
          size="lg"
        />
        Disable particles
      </button>

      <button
        className="btn btn-slate btn-responsive block ml-auto mr-auto sm:mb-4 mb-1"
        onClick={handleFile}>
        <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-file-arrow-up" size="lg" />
        Import data
      </button>

      <button className="btn btn-slate btn-responsive" onClick={() => fetchParticles(setParticles)}>
        <FontAwesomeIcon className="mr-1 initial" icon="fa-solid fa-arrows-rotate" />
        Refresh
      </button>
    </div>
  );
}

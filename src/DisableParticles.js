import React, { useState } from 'react';
import postParticles from './common/postParticles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    <div className="w-1/4 text-center">
      <span className="block mb-2 uppercase">List to disable</span>
      <textarea
        id="particlesToDisable"
        className="bg-slate-800 h-1/4 w-2/3 rounded-xl overflow-auto no-scrollbar block ml-auto mr-auto mb-4 h-[28rem]"
        onChange={(e) => setParticlesToDisable(e.target.value)}
        value={particlesToDisable}></textarea>
      <button className="block ml-auto mr-auto btn btn-slate mb-4" onClick={() => post()}>
        <FontAwesomeIcon className="mr-1" icon="fa-solid fa-eye-slash" size="lg" />
        Disable particles
      </button>

      <button className="btn btn-slate" onClick={handleFile}>
        <FontAwesomeIcon className="mr-1" icon="fa-solid fa-file-arrow-up" size="lg" /> Import data
      </button>
    </div>
  );
}

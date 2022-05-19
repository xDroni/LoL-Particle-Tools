import React from "react";

export default function Particles({ particles }) {
  const particlesByState = Object.entries(particles).reduce(
    (prev, curr) => ({
      enabled: curr[1] ? [...prev.enabled, curr[0]] : [...prev.enabled],
      disabled: !curr[1] ? [...prev.disabled, curr[0]] : [...prev.disabled],
    }),
    { enabled: [], disabled: [] }
  );
  return (
    <div className="flex justify-center">
      <div className="w-1/3 text-center">
        <label className="block mb-2 uppercase text-center">Enabled particles</label>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar"
        >
          {particlesByState.enabled.map((particleName) => {
            return (
              <option key={particleName} value={particleName} className="hover:bg-slate-700 rounded-xl">
                {particleName}
              </option>
            );
          })}
        </select>
      </div>
      <div className="w-1/3 text-center">
        <label className="block mb-2 uppercase">Disabled particles</label>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar"
        >
          {particlesByState.disabled.map((particleName) => {
            return (
              <option key={particleName} value={particleName} className="hover:bg-slate-700 rounded-xl">
                {particleName}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

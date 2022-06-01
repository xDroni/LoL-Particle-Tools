import React, { useDeferredValue, useState } from "react";
import DisableParticles from "./DisableParticles";

export default function Particles({ particles, setParticles }) {
  const particlesByState = Object.entries(particles).reduce(
    (prev, curr) => ({
      enabled: curr[1] ? [...prev.enabled, curr[0]] : [...prev.enabled],
      disabled: !curr[1] ? [...prev.disabled, curr[0]] : [...prev.disabled],
    }),
    { enabled: [], disabled: [] }
  );

  const [filter, setFilter] = useState("");
  const deferredFilter = useDeferredValue(filter);

  const filtered = particlesByState.enabled.filter((p) => {
    const regex = new RegExp(deferredFilter, "i");
    return deferredFilter === ""
      ? true
      : regex.test(p) || regex.test(p.replaceAll("_", ""));
  });

  function handleChange(event) {
    setFilter(event.target.value);
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/3 text-center">
        <span className="block mb-2 uppercase">Enabled particles</span>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar h-[32rem] mb-4"
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
          onChange={handleChange}
          type="text"
          className="ml-auto mr-auto block bg-slate-800 placeholder-cyan-200"
          placeholder="Filter"
        />
      </div>
      <div className="w-1/3 text-center">
        <span className="block mb-2 uppercase">Disabled particles</span>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar h-[32rem] mb-4"
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
        <DisableParticles setParticles={setParticles} />
      </div>
    </div>
  );
}

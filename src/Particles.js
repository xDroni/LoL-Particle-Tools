import React, { useDeferredValue, useState } from "react";

export default function Particles({ particles }) {
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
        <input
          value={filter}
          onChange={handleChange}
          type="text"
          className="ml-auto mr-auto block bg-slate-800 placeholder-cyan-200"
          placeholder="Filter"
        />
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar"
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
      </div>
      <div className="w-1/3 text-center">
        <span className="block mb-2 uppercase">Disabled particles</span>
        <select
          multiple
          className="bg-slate-800 w-2/3 rounded-xl overflow-auto no-scrollbar"
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
      </div>
    </div>
  );
}

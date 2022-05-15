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
    <>
      <label>Enabled particles</label>
      <select multiple>
        {particlesByState.enabled.map((particleName) => {
          return (
            <option key={particleName} value={particleName}>
              {particleName}
            </option>
          );
        })}
      </select>

      <label>Disabled particles</label>
      <select multiple>
        {particlesByState.disabled.map((particleName) => {
          return (
            <option key={particleName} value={particleName}>
              {particleName}
            </option>
          );
        })}
      </select>
    </>
  );
}

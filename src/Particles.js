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
      <p>Enabled particles</p>
      <textarea
        readOnly={true}
        value={particlesByState.enabled.join("\n")}
      ></textarea>
      <p>Disabled particles</p>
      <textarea
        readOnly={true}
        value={particlesByState.disabled.join("\n")}
      ></textarea>
    </>
  );
}

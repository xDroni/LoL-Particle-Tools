import React from "react";

export default function Particles({ particles }) {
  return (
    <>
      <p>Enabled particles</p>
      <textarea
        readOnly={true}
        value={Object.entries(particles)
          .filter(([, enabled]) => {
            return enabled;
          })
          .map(([particle]) => particle)
          .join("\n")}
      ></textarea>
      <p>Disabled particles</p>
      <textarea
        readOnly={true}
        value={Object.entries(particles)
          .filter(([, enabled]) => {
            return !enabled;
          })
          .map(([particle]) => particle)
          .join("\n")}
      ></textarea>
    </>
  );
}

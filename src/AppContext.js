import React, { useState } from 'react';

export const LoadingContext = React.createContext(null);
export const ParticlesContext = React.createContext(null);

export const LoadingContextProvider = (props) => {
  const [interval, setInterval] = useState(null);
  const [replayLoad, setReplayLoad] = useState(null);

  const contextValue = { interval, setInterval, replayLoad, setReplayLoad };
  return <LoadingContext.Provider value={contextValue}>{props.children}</LoadingContext.Provider>;
};

export const ParticlesContextProvider = (props) => {
  const [particles, setParticles] = useState([]);
  const [particlesByState, setParticlesByState] = useState({ enabled: [], disabled: [] });

  const contextValue = { particles, setParticles, particlesByState, setParticlesByState };
  return (
    <ParticlesContext.Provider value={contextValue}>{props.children}</ParticlesContext.Provider>
  );
};

import config from '../config.json';

export default async function fetchParticles(setParticles, setReplayLoad, onlyEnabled) {
  try {
    const result = await fetch(
      `${config.address}:${config.port}/replay/${config.particlesEndpoint}`
    );
    const json = await result.json();
    if (json?.errorCode === undefined) {
      setParticles(json);
      setReplayLoad(false);
      return onlyEnabled === true
        ? Object.fromEntries(Object.entries(json).filter(([, state]) => Boolean(state)))
        : json;
    }
    setReplayLoad(true);
    return Promise.reject(Error(json.errorCode));
  } catch (err) {
    setReplayLoad(true);
    console.error(err);
  }
}

export function autoFetch(setParticles, setReplayLoad, timeout) {
  return setInterval(() => fetchParticles(setParticles, setReplayLoad), timeout);
}

import config from '../config.json';

export default async function fetchParticles(setParticles, replayLoad, setReplayLoad, onlyEnabled) {
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
    if (replayLoad !== null) {
      setReplayLoad(true);
    }
    return Promise.reject(Error(json.errorCode));
  } catch (err) {
    if (replayLoad !== null) {
      setReplayLoad(true);
    }
    console.error(err);
  }
}

export function autoFetch(setParticles, replayLoad, setReplayLoad, timeout) {
  return setInterval(() => fetchParticles(setParticles, replayLoad, setReplayLoad), timeout);
}

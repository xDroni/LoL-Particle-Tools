import config from '../config.json';

export default async function fetchParticles(setParticles) {
  try {
    const result = await fetch(
      `${config.address}:${config.port}/replay/${config.particlesEndpoint}`
    );
    const json = await result.json();
    if (json?.errorCode === undefined) {
      setParticles(json);
      return json;
    }
    return Promise.reject(Error(json.errorCode));
  } catch (err) {
    console.error(err);
  }
}

export function autoFetch(setParticles) {
  return setInterval(() => fetchParticles(setParticles), 3000);
}

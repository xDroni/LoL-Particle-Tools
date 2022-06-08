import config from '../config.json';

export default async function postParticles(particles, setParticles) {
  fetch(`${config.address}:${config.port}/replay/${config.particlesEndpoint}`, {
    method: 'POST',
    body: JSON.stringify(particles),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((res) => setParticles(res))
    .catch((e) => console.error(e));
}

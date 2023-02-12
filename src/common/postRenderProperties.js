import config from '../config.json';

export default async function postRenderProperties(renderProperties) {
  fetch(`${config.address}:${config.port}/${config.postRenderPropertiesEndpoint}`, {
    method: 'POST',
    body: JSON.stringify(renderProperties),
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch((e) => console.error(e));
}

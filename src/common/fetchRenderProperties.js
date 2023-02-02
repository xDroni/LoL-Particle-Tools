import config from '../config.json';

export default async function fetchRenderProperties(replayLoad, setReplayLoad) {
  try {
    const result = await fetch(
      `${config.address}:${config.port}/${config.getRenderPropertiesEndpoint}`
    );
    const json = await result.json();
    if (json?.errorCode === undefined) {
      return json;
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

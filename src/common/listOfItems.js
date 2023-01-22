import postParticles from './postParticles';

export default function listOfItems(items, locationInProgress, particles, setParticles) {
  return items.map((item) => {
    return (
      <label
        key={item}
        className={`${locationInProgress ? 'opacity-40' : ''} flex w-[95vh] justify-center mb-2`}
      >
        <span className="mr-2 no-scrollbar overflow-auto">{item}</span>
        <input
          id="red-checkbox"
          type="checkbox"
          disabled={locationInProgress}
          checked={!particles[item]}
          onChange={() => postParticles({ [item]: !particles[item] }, setParticles)}
          className="mr-2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-red-600 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-600 dark:ring-offset-gray-800 dark:focus:ring-red-600"
        />
        <span>OFF</span>
      </label>
    );
  });
}

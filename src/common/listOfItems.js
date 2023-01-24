import postParticles from './postParticles';

export default function listOfItems(items, locationInProgress, particles, setParticles) {
  return items.map((item) => {
    return (
      <div
        key={item}
        className={`${locationInProgress ? 'opacity-40' : ''} flex w-[95vh] justify-center mb-2`}
      >
        <span className="mr-2 no-scrollbar overflow-auto">{item}</span>
        <input
          id={item}
          type="checkbox"
          disabled={locationInProgress}
          checked={!particles[item]}
          onChange={() => postParticles({ [item]: !particles[item] }, setParticles)}
          className="checkbox-focus mr-2 h-4 w-4 text-red-800 rounded bg-slate-800 transition duration-100 cursor-pointer"
        />
        <label htmlFor={item}>OFF</label>
      </div>
    );
  });
}

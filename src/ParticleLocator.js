import React from "react";

const createPromise = () => {
  let resolver;
  return [
    new Promise((resolve) => {
      resolver = resolve;
    }),
    resolver,
  ];
};

let promiseResolver;

export default function ParticleLocator({ particles, setParticles }) {
  async function findParticle(entries) {
    if (entries.length === 1) {
      console.log(`Particle name: ${entries[0][0]}`);
      return entries[0][0];
    }

    const split = {
      entries1: entries.slice(0, entries.length / 2),
      entries2: entries.slice(entries.length / 2),
    };

    const stateChanged = split.entries1.map(([key, value]) => [key, !value]);
    const json = Object.fromEntries(stateChanged);
    split.entries1 = stateChanged;

    const result = await fetch("https://127.0.0.1:2999/replay/particles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(json),
    });

    const data = await result.json();
    setParticles(data)

    const [promise, resolver] = createPromise();
    promiseResolver = resolver;

    let answer = await promise;

    while (true) {
      switch (answer) {
        case "y":
          return findParticle(split.entries1);
        case "n":
          return findParticle(split.entries2);
        default:
          console.log("Wrong answer");
          answer = await promise;
      }
    }
  }

  return (
    <>
      <p onClick={() => findParticle(Object.entries(particles))}>
        Particle Locator
      </p>
      <button className="block ml-10" onClick={() => promiseResolver("y")}>
        Y
      </button>
      <button className="block ml-10" onClick={() => promiseResolver("n")}>
        N
      </button>
    </>
  );
}

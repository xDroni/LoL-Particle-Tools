import React from 'react';

export default function ModalContainer({ handleModal }) {
  return (
    <div
      id="ModalContainer"
      className="modal-container-transition pointer-events-none fixed inset-0 z-20 flex items-center justify-center bg-slate-900 bg-opacity-50 opacity-0"
      onClick={(e) => (e.target === e.currentTarget ? handleModal() : null)}
    >
      <div
        id="ModalBox"
        className="modal-transition pointer-events-none flex flex-col rounded-lg border border-gray-400 bg-slate-800 p-4 opacity-0 shadow-2xl"
      >
        <div className="mb-3 flex justify-between">
          <h3 className="text-2xl font-bold">How to use this tool?</h3>
          <button onClick={handleModal}>Close</button>
          {/* icon */}
        </div>
        <div className="mb-3 flex justify-between">
          <p className="text-md italic">
            If replay is not detected, try installing{' '}
            <a
              className="text-blue-400 underline"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/RiotGames/leaguedirector"
            >
              League Director
            </a>{' '}
            and make sure it works there first.
          </p>
        </div>
        <h4 className="text-xl font-bold">Particle Locator</h4>
        <h5 className="mt-2 text-lg text-teal-400">Auto mode</h5>
        <div className="ml-1.5">
          <p>
            Video tutorial:{' '}
            <a
              className="text-blue-400 underline"
              target="_blank"
              rel="noreferrer"
              href="https://youtu.be/hG5-MSInKL0"
            >
              https://youtu.be/hG5-MSInKL0
            </a>
          </p>
          <ol className="ml-8 list-decimal">
            <li>Open the replay</li>
            <li>
              Set in-game window mode to either <span className="font-bold">borderless</span> or{' '}
              <span className="font-bold">windowed</span>
            </li>
            <li>
              (optional) If you get incorrect results or the process takes forever try to turn off
              in-game shadows -{' '}
              <a
                className="text-blue-400 underline"
                target="_blank"
                rel="noreferrer"
                href="https://github.com/xDroni/LoL-Particle-Tools/blob/main/demo/settings/shadow-quality.png?raw=true"
              >
                screenshot
              </a>
            </li>
            <li>Pause the replay playback</li>
            <li>
              Open Particle Locator and click <span className="font-bold">Start</span>
            </li>
            <li>
              Select the particle(s) that you want to deactivate (and automatically find their name)
            </li>
          </ol>
        </div>
        <h5 className="mt-2 text-lg text-red-400">Legacy mode</h5>
        <div className="ml-1.5">
          <p>
            Video tutorial:{' '}
            <a
              className="text-blue-400 underline"
              target="_blank"
              rel="noreferrer"
              href="https://youtu.be/FvQJKjt-hYk"
            >
              https://youtu.be/FvQJKjt-hYk
            </a>
          </p>
          <ul className="ml-8 list-disc">
            <li>
              Same as auto mode, except that you have to manually select whether a particle has
              changed its state (appeared / disappeared)
            </li>
          </ul>
        </div>
        <p className="mt-4">More info here: </p>
        <p>
          <a
            className="text-blue-400 underline"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/xDroni/LoL-Particle-Tools/blob/main/README.md"
          >
            https://github.com/xDroni/LoL-Particle-Tools/blob/main/README.md
          </a>
        </p>
      </div>
    </div>
  );
}

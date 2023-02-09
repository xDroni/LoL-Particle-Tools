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
        <h4 className="text-xl font-bold">Particle Locator</h4>
        <h5 className="mt-2 text-lg text-teal-400">Auto mode</h5>
        <div className="ml-1.5">
          <p>
            Video tutorial:{' '}
            <a
              className="text-blue-400 underline"
              target="_blank"
              rel="noreferrer"
              // href="https://youtu.be/F4FTJY52NtU?t=28"
            >
              TODO
            </a>
          </p>
          <ol className="ml-8 list-decimal">
            <li>Open the replay</li>
            <li>
              Set in-game window mode to either <span className="font-bold">Borderless</span> or{' '}
              <span className="font-bold">Windowed</span>
            </li>
            <li>Pause the replay</li>
            <li>
              Open Particle Locator and click <span className="font-bold">Start</span>
            </li>
            <li>
              Select the particle(s) that you want to disable (and automatically find their name)
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
              href="https://youtu.be/FvQJKjt-hYk?t=28"
            >
              https://youtu.be/FvQJKjt-hYk?t=28
            </a>
          </p>
          <ul className="ml-8 list-decimal list-disc">
            <li>
              Same as auto mode, except that you have to manually select whether a particle has
              changed its state (appeared / disappeared)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

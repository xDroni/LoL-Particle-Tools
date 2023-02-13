# LoL Particle Tools

## DEMO

Auto mode - https://youtu.be/hG5-MSInKL0

Legacy mode - https://youtu.be/FvQJKjt-hYk

## Features

- Fast particle search (about 3 seconds per particle in Auto mode)
- Deactivate particles from your own lists using a text file
- Save deactivated particles for later use (or if the game crashes)

### Particle Locator

Helps you find unwanted particle (name) and deactivate it.

### How to use Particle Locator?

### Auto Locating

1. Open the replay
2. Set the in-game window mode to either **borderless** or **windowed** ([screenshot](demo/settings/window-mode.png?raw=true 'window mode'))
3. (optional) If you get incorrect results or the process takes forever try to **turn off in-game shadows** ([screenshot](demo/settings/shadow-quality.png?raw=true 'shadow quality'))
4. Pause the playback
5. Open Particle Locator and click on Start
6. Select the particle(s) that you want to deactivate (and automatically find their name)

### Legacy Locating

- Same as Auto Locating, except that you have to manually select whether a particle has changed its state (appeared / disappeared)

### How does it work?

It simply makes requests to League of Legends Replay API locally.

### Auto Locating

1. Takes the list of active particles
2. User selects the area with particles he wants to deactivate
3. It takes the snapshot of the selected area
4. The list of currently activated particles is divided into 2 groups
5. It deactivates all particles of the first group (activates them if they were deactivated)
6. Takes another snapshot of the selected area and compares it with the previous one
7. If there are differences in the snapshot (the particle has changed its state) we can assume that it's located in the first group.
   If there are no differences we know that it's located in the second group
8. It repeats the division and comparison until there is only one particle left in the list

On average, a 5v5 Summoner's Rift **replay has about 1700-2300 particles**, which means **it takes 10-11 divisions and comparisons** (~3 seconds) to locate one particle.

### Legacy Locating

- Same as Auto Locating, but without automated comparisons. User must manually determine if particle has changed its state (~15 seconds per particle)

### Images

![particle-locator-1](demo/particle-locator-1.png?raw=true)
![particle-locator-2](demo/particle-locator-2.png?raw=true)
![particle-locator-3](demo/particle-locator-3.png?raw=true)
![particle-locator-4](demo/particle-locator-4.png?raw=true)
![particle-locator-5](demo/particle-locator-5.png?raw=true)
![particle-locator-6](demo/particle-locator-6.png?raw=true)
![particle-locator-7](demo/particle-locator-7.png?raw=true)
![particle-locator-8](demo/particle-locator-8.png?raw=true)
![particle-locator-9](demo/particle-locator-9.png?raw=true)
![particle-locator-10](demo/particle-locator-10.png?raw=true)
![particle-locator-11](demo/particle-locator-11.png?raw=true)
![particle-locator-12](demo/particle-locator-12.png?raw=true)
![particle-locator-13](demo/particle-locator-13.png?raw=true)
![particle-locator-14](demo/particle-locator-14.png?raw=true)
![particle-locator-15](demo/particle-locator-15.png?raw=true)
![particle-locator-16](demo/particle-locator-16.png?raw=true)

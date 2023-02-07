# LoL Particle Tools

## DEMO

https://youtu.be/FvQJKjt-hYk

## Features

- Locate particles fast (about 3 seconds per particle using Auto mode)
- Disable particles from your own lists using text file
- Save disabled particles for later (or when the replay crashes)

### Particle Locator

Helps you find unwanted particle (name) and disable it.

### How to use Particle Locator?

### Auto Locating

1. Open the replay
2. Set in-game window mode to either Borderless or Windowed
3. Pause the replay
4. Open Particle Locator and click Start
5. Select the particle(s) that you want to disable (and automatically find their name)

### Legacy Locating

- Same as Auto Locating, except that you have to manually select whether a particle has changed its state (appeared / disappeared)

### How does it work?

It simply makes requests to League of Legends Replay API locally.

### Auto Locating

1. It takes the list of currently enabled particles
2. User selects the area with particles he wants to disable
3. It takes the snapshot of selected area
4. The list of currently enabled particles is divided into 2 groups
5. It disables (enables if they were disabled) all particles from the first group
6. It takes the snapshot of selected area again and compares it to the previous one
7. If there are differences in the snapshot (the particle changed its state) we can assume that it's located in the first group.
   If there are no differences we know it's located in the second group
8. It repeats the division and comparison until there is only one particle left in the list

On average, a 5v5 Summoner's Rift **replay has about 1700-2300 particles**, which means **it will take 10-11 comparisons** (~3 seconds) to locate one particle.

### Legacy Locating

- Same as Auto Locating, but without automated comparisons. User needs to manually determine if particle has changed its state (~15 seconds per particle)

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

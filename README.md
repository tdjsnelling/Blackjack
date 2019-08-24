# Blackjack

Basic Blackjack game build with React, Express, MongoDB and Redis.

[Demo](https://blackjack.tdjsnelling.now.sh/)

I originally built this to be played with Bitcoin, but UK regulations are strict and I didn't fancy jumping through the hoops. It could still be adapted if someone wanted to make the changes.

### Game logic

The game logic is powered by the amazing [engine-blackjack](https://github.com/kedoska/engine-blackjack) library. My project just adds a front-end and account/state management.

### Architecture

- Each user creates an account with email address and password.
- Each account has a unique identifier. This is used to keep track of an accounts current game state.
- Game state is stored by redis; the `key` is the users identifier, and the `value` is the current game state.
- All game actions happen on the server. The user makes a request with their identifier and their desired action, the server carries out the action and responds with the new game state.

### Deployment

Currently, the project is set up to have the front-end deployed on [Now](https://now.sh) and the back-end deployed on any platform that will build and run Docker containers.

### License

GPLv3.0. See LICENSE.

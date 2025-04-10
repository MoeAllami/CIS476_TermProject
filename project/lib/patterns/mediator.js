// lib/patterns/mediator.js
class MessagingMediator {
  constructor() {
    this.participants = {};
  }

  register(participant, id) {
    this.participants[id] = participant;
  }

  send(message, from, to) {
    if (this.participants[to]) {
      return this.participants[to].receive(message, from);
    }
    return false;
  }
}

// Singleton pattern for the messaging mediator
class MessagingMediatorSingleton {
  static instance;

  static getInstance() {
    if (!MessagingMediatorSingleton.instance) {
      MessagingMediatorSingleton.instance = new MessagingMediator();
    }
    return MessagingMediatorSingleton.instance;
  }
}

export const messagingMediator = MessagingMediatorSingleton.getInstance();

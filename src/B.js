import A from './A';
import {
  getType
}
from 'model-attributes';
import {
  LogLevelMixin
}
from 'loglevel-mixin';

import {
  StateTransitionMixin,
  defineActionMethods,
  prepareActions
}
from 'statetransition-mixin';

const actions = prepareActions({
  start: {
    stopped: {
      target: 'running',
      during: 'starting',
      rejected: 'failed',
      timeout: 5000
    }
  },
  restart: {
    stopped: {
      target: 'running',
      during: 'starting',
      rejected: 'failed',
      timeout: 5000
    },
    running: {
      target: 'running',
      during: 'restarting',
      timeout: 5000
    }
  },
  stop: {
    running: {
      target: 'stopped',
      during: 'stopping',
      rejected: 'failed',
      timeout: 5000
    },
    starting: {
      target: 'stopped',
      during: 'stopping',
      rejected: 'failed',
      timeout: 5000
    },
    failed: {
      target: 'stopped',
      during: 'stopping',
      rejected: 'failed',
      timeout: 1000
    }
  }
});

export default class B extends StateTransitionMixin(LogLevelMixin(A), actions, 'stopped') {
  constructor() {
    super();
    console.log('constructor B');
    this.type = getType('string');
    console.log(`type: ${this.type.name}`);
    console.log(`logLevel: ${this.logLevel}`);
    console.log(`state: ${this.state}`);
  }
}

defineActionMethods(A.prototype, actions);

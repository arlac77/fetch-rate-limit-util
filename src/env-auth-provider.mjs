/**
 * Provide credentials from environment variables
 */
export class EnvironmentAuthProvider {
  constructor(options = {}) {}

  async provideCredentials(realm) {
    console.log(JSON.stringify(realm));
    return undefined;
  }
}

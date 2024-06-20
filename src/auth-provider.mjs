import Enquirer from "enquirer";

/**
 * Provide credentials from console input
 */
export class ConsoleAuthProvider {
  async provideCredentials(realm) {
    const title = realm?.Basic?.realm || "???";

    const response = await Enquirer.prompt([
      {
        type: "input",
        name: "user",
        message: `What is your user? (${title})`
      },
      {
        type: "password",
        name: "password",
        message: `What is your password? (${title})`
      }
    ]);

    return response;
  }
}

export default ConsoleAuthProvider;

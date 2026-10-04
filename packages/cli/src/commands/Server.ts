/**
 * `lembaranz server`
 *
 * Starts the local vault server that the web UI connects to. This is the only
 * process that holds the master key, which is the point: a browser tab holds a
 * session token, not the key.
 *
 * Loopback by default. `--host 0.0.0.0` opts into LAN exposure, because anyone
 * who can reach this port can read the vault once it is unlocked.
 *
 * The connect link is the reason this command is pleasant to use. The browser
 * needs the origin and the token, and asking a human to select a 36-character
 * UUID out of terminal output and paste it into a form was the single largest
 * drop-off in the old flow: most people never got as far as typing a password.
 * So the server prints a link that carries both, and `--open` launches it.
 */
import { Command } from 'commander';
import { prepareContext } from '../utils.js';

/** Where the dashboard runs by default (the Vite dev server). */
const DEFAULT_WEB = 'http://127.0.0.1:5120';

/**
 * Opens a URL in the user's browser.
 *
 * Every platform is a different command and each may be missing, so a failure
 * is expected rather than exceptional: the link is on stdout either way, which
 * is the part that has to work.
 */
function openInBrowser(url: string): void {
  const command =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  try {
    // Detached and unref'd so the server keeps running and the CLI never waits
    // on a GUI process. `start` is a cmd builtin and needs the empty title arg.
    const args = process.platform === 'win32' ? ['', url] : [url];
    Bun.spawn([command, ...args], { stdout: 'ignore', stderr: 'ignore' }).unref();
  } catch {
    // No browser here (headless box, missing xdg-open). The printed link stands.
  }
}

export function registerServerCommand(program: Command) {
  program
    .command('server')
    .description('Run the local vault server for the web UI')
    .option('--host <host>', 'Host to bind (0.0.0.0 exposes the vault to your network)', process.env.LEMBARANZ_HOST)
    .option('--port <port>', 'Port to listen on', process.env.LEMBARANZ_PORT ?? '5121')
    .option('--web <url>', 'Dashboard origin to build the connect link for', process.env.LEMBARANZ_WEB_URL ?? DEFAULT_WEB)
    .option('--open', 'Open the connect link in your browser as soon as the server is ready', false)
    .action(async (options) => {
      const host: string = options.host ?? '127.0.0.1';
      const web: string = String(options.web).replace(/\/$/, '');

      if (host !== '127.0.0.1' && host !== 'localhost') {
        console.log(
          `\x1b[33m⚠  Binding to ${host} exposes your vault to everyone on this network.\x1b[0m`
        );
      }

      // Initialize storage for the resolved vault before the server imports
      // core, so the adapter is bound to the right file.
      await prepareContext(program.opts());

      // The server reads these on import; they cannot be passed as arguments
      // without reworking its module shape, and an env var is the smaller diff.
      process.env.LEMBARANZ_HOST = host;
      process.env.LEMBARANZ_PORT = String(options.port);

      const mod = await import('@lembaranz/server');
      const origin = `http://127.0.0.1:${options.port}`;

      // The token rides in the fragment, which browsers never send to a server
      // and never put in a Referer header. The dashboard strips it from the URL
      // on the first render, so it does not linger in history either.
      const link = `${web}/app#h=${encodeURIComponent(origin)}&t=${mod.TOKEN}`;

      console.log(`\n  Open the vault:\n\n  \x1b[36m${link}\x1b[0m\n`);
      if (options.open) openInBrowser(link);
    });
}

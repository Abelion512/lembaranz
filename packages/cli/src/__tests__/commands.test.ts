/**
 * The command surface.
 *
 * `docs/en/cli.md`, the PRD, the README, and `llms.txt` all promise a set of
 * commands to a reader who has never run the binary. Before this suite existed,
 * `docs/en/cli.md` listed six commands (`mulai`, `pantau`, `jelajah`,
 * `pengaturan`, `petik`, `tanam`) that were never registered on the Commander
 * program, and the PRD listed five more that were equally fictional. Nothing
 * failed, because nothing compared the two.
 *
 * So this asserts the real registration. It reads `program.commands` rather than
 * `--help` output on purpose: a command name is machine state and can be
 * asserted exactly, while help text is prose that may be reworded freely.
 *
 * When a command is added or removed, this fails until the expectation and the
 * documentation are both updated. That is the point.
 */
import { describe, expect, it } from "bun:test";
import { buildProgram } from "../main";

/** Every top-level command name and alias the binary accepts. */
const EXPECTED_SURFACE = [
  "browse",
  "cfg",
  "config",
  "dashboard",
  "doctor",
  "export",
  "import",
  "init",
  "launch",
  "monitor",
  "run",
  "security",
  "server",
  "setup",
  "update",
];

describe("the CLI command surface", () => {
  const program = buildProgram("0.0.0");

  it("registers exactly the documented commands and aliases", () => {
    const actual = program.commands
      .flatMap((command) => [command.name(), ...command.aliases()])
      .sort();

    expect(actual).toEqual([...EXPECTED_SURFACE].sort());
  });

  it("does not register any command the documentation had to retract", () => {
    // Named explicitly rather than relying on the exact-match assertion above,
    // so a future reintroduction fails with a message that explains the history.
    const retracted = ["carve", "env", "plant", "search", "pick", "mulai", "pantau", "jelajah", "pengaturan", "petik", "tanam"];
    const actual = program.commands.map((command) => command.name());

    for (const name of retracted) {
      expect(actual).not.toContain(name);
    }
  });

  it("exposes the config group subcommands the CLI guide documents", () => {
    const config = program.commands.find((command) => command.name() === "config");
    expect(config).toBeDefined();

    const subcommands = config!.commands.map((command) => command.name()).sort();
    expect(subcommands).toEqual(["get", "hook", "list", "load", "save", "set", "show"]);
  });

  it("keeps the load/fetch alias the CLI guide documents", () => {
    const config = program.commands.find((command) => command.name() === "config");
    const load = config!.commands.find((command) => command.name() === "load");

    expect(load?.aliases()).toEqual(["fetch"]);
  });
});
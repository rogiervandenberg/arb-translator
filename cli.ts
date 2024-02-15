import { Translator } from "./translator";

const flutterProject = "./";
const l10nConfig = "l10n.yaml";

console.log("Starting translation based on " + flutterProject + l10nConfig);

const t = new Translator(flutterProject + l10nConfig);
t.run();

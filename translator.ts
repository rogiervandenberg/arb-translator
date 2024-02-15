import { load } from "js-yaml";
import { readdir } from "node:fs/promises";
import path from "path";

export class Translator {
  private flutterProjectPath: string | undefined;
  private googleAPIKey: string | undefined;
  private arbDir: string | undefined;
  private templateFile: string | undefined;

  constructor(private readonly configPath: string) {
    this.flutterProjectPath = path.parse(configPath).dir;
  }

  public async run() {
    const configLoaded = await this.checkConfig();
    if (!configLoaded) {
      process.exit();
    }

    const keyLoaded = await this.checkAPIkey();
    if (!keyLoaded) {
      process.exit();
    }

    const arbFiles = await readdir(this.arbDir!);
    const targetFiles = arbFiles.filter((f) => f !== this.templateFile!);

    for (const file of targetFiles) {
      await this.processTranslationFile(file);
    }

    console.log(
      "All translations are complete and can be found in " + this.arbDir
    );
  }

  private async processTranslationFile(file: string) {
    const locale = this.deriveLocaleFromFileName(file);
    if (locale === "en") {
      return;
    }

    const sourceFile = Bun.file(path.join(this.arbDir!, this.templateFile!));
    const sourceText = await sourceFile.text();
    const sources = load(sourceText) as Record<string, any>;

    const arbFile = Bun.file(path.join(this.arbDir!, file));
    const text = await arbFile.text();
    const translations = load(text) as Record<string, any>;

    // for each key in the source file, if it does not exist yet in the translations file
    // then add it with a translation
    for (const key in sources) {
      // if the key is not yet translated, translate it now
      if (!translations[key] && !key.startsWith("@")) {
        translations[key] = await this.translate(sources[key], locale);
      }
    }

    // write the json back into the arb file
    await Bun.write(arbFile, JSON.stringify(translations, null, 2));
    console.log(`Translations for ${file} are complete`);
  }

  private deriveLocaleFromFileName(file: string): string {
    const parts = file.split("_");
    if (parts.length === 2) {
      return parts[1].split(".")[0];
    } else if (parts.length === 3) {
      return parts[1];
    } else {
      return "en";
    }
  }

  private async checkAPIkey(): Promise<boolean> {
    const file = Bun.file(
      path.join(this.flutterProjectPath!, "translations.yaml")
    );

    let exists = await file.exists(); // boolean;
    if (!exists) {
      console.log(
        "API key file not found, please create translations.yaml in the root of your project with the google-translate-key."
      );
      return false;
    }

    const text = await file.text();
    const config = load(text) as Record<string, any>;

    if (!config["google-translate-key"]) {
      console.log("No Google API key found in the config file.");
      return false;
    }

    this.googleAPIKey = config["google-translate-key"];
    return true;
  }

  private async checkConfig(): Promise<boolean> {
    const file = Bun.file(this.configPath);

    let exists = await file.exists(); // boolean;
    if (!exists) {
      console.log("Could not find " + this.configPath);
      return false;
    }

    const text = await file.text();
    const l10nConfig = load(text) as Record<string, any>;

    if (!l10nConfig["arb-dir"]) {
      console.log("No arb dir found");
      return false;
    }

    if (!l10nConfig["template-arb-file"]) {
      console.log("No template ARB file found");
      return false;
    }

    this.googleAPIKey = l10nConfig["google-translate-key"];
    this.arbDir = path.join(
      this.flutterProjectPath ?? "/",
      l10nConfig["arb-dir"]
    );
    this.templateFile = l10nConfig["template-arb-file"];

    return true;
  }

  async translate(input: String, locale: string): Promise<String> {
    const key = this.googleAPIKey;

    const response = await fetch(
      `https://www.googleapis.com/language/translate/v2?key=${key}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: input,
          source: "en",
          target: locale.substr(0, 2),
        }),
      }
    );
    const result = await response.json();

    console.log(
      `Translation for ${input} in ${locale} is ${result["data"]["translations"][0]["translatedText"]}`
    );

    return result["data"]["translations"][0]["translatedText"];
  }
}

# arb-translator

A simple CLI to translate ARB files ([App Resource Bundle](https://github.com/google/app-resource-bundle) files (.arb)) using Google Translate API.

Based on the settings in your `l10n.yaml` file, the CLI will translate not yet translated keys in your template ARB file, and save them in the ARB directory that is specified in the `l10n.yaml` file, for each language.

Each time you run the CLI, it will only translate the keys that are not yet translated. So you can run it multiple times to keep your translations up to date automatically as you add new keys to your template ARB file.

## Background

I am working on a Flutter app. Following the [official documentation](https://flutter.dev/docs/development/accessibility-and-localization/internationalization#add-localizations-to-your-app) for internationalization in Flutter, you need to create and maintain the ARB files for your app. However, it does not provide a way to translate these files. One way to translate would be [doing so manually](https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization#adding-your-own-localized-messages) or using paid 3rd party services.

This CLI aims to solve this problem by using the Google Translate API to translate the ARB files automatically and effortlessly.

## Usage, TL;DR

- Compile the project and add the executable to your Flutter project
- Create a Google Cloud project and enable the Translate API, with an API key
- Add the API key to your `l10n.yaml` file
- Add a new text string to your project and run the executable

## Usage, step by step

### Step 1: Compile the project and add the executable to your Flutter project

Firstly, you need [bun](https://bun.sh) to run this project. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

```bash
bun build ./cli.ts --compile --outfile make_translations
```

Move the `flutter-create-translations` executable to your Flutter project and add the file to your .gitignore.

### Step 2: Create a Google Cloud project and enable the Translate API

- Go to: <https://console.developers.google.com/apis/dashboard>
- Select (or create) a project
- Click button "Enable API's and services" (on top)
- Search for "Cloud Translation API"
- Click "Enable"
- Once enabled, go to the "Credentials" (left side) section on your API overview
- Click "Create credential" (top bar)
- In de text "We'll help you set up the correct credentials.
  If you want you can skip this step and create an API key, client ID or service account.", **choose the link "API key"**.
- Give it a name and click "Create"

You can copy the key now.

### Step 3: Add your API key

In the root of your project, create a new `translations.yaml` file (`${FLUTTER_PROJECT}/translations.yaml`) and add a new `google-translate-key`-key to this file with your API key, like so:

```yaml
google-translate-key: "superSecretAPIKey"
```

You probably want to add the `translations.yaml` file to your `.gitignore`.

### Step 4: Run the executable

Add a new string to your template ARB file, e.g. in ${FLUTTER_PROJECT}/lib/l10n, in the file app_en.arb template file, you add:

```json
{
  "helloWorld": "Hello World!",
  "@helloWorld": {
    "description": "The conventional newborn programmer greeting"
  }
}
```

Make sure you have at least one other ARB bundle file in the same directory, e.g. app_de.arb, app_es.arb, etc.

Run the executable:

```bash
./flutter-create-translations
```

You'll see that the translations will be **automagically** added to your German and Spanish files:

```json
{
  "helloWorld": "Hallo Welt!"
}
```

```json
{
  "helloWorld": "¡Hola Mundo!"
}
```

🎉 Happy coding!

## Development

Firstly, you need [bun](https://bun.sh) to run this project. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run cli.ts
```

## Build

```bash
bun build ./cli.ts --compile --outfile make_translations
```

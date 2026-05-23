/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `open-project` command */
  export type OpenProject = ExtensionPreferences & {
  /** Projects Directory - Folder that contains your project folders. */
  "projectsDirectory": string,
  /** Editor - Code editor used to open project folders. */
  "editor": "Visual Studio Code" | "Cursor" | "Zed" | "Windsurf" | "Antigravity" | "IntelliJ IDEA" | "WebStorm" | "PyCharm" | "GoLand" | "PhpStorm" | "CLion" | "Rider" | "RubyMine" | "Android Studio" | "VSCodium" | "Sublime Text" | "Nova" | "default"
}
}

declare namespace Arguments {
  /** Arguments passed to the `open-project` command */
  export type OpenProject = {}
}


# Open Project

Open Project is a Raycast extension for developers who keep their code projects inside a shared folder and want a fast way to open them in their preferred editor.

<img width="1000" height="625" alt="open-project-3" src="https://github.com/user-attachments/assets/49f5ff7a-159c-44ef-a7a5-84add79fc12c" />


The extension lists the direct folders inside your projects directory, lets you search them, and opens the selected project in a configurable code editor. It also keeps local usage history so the projects you open most often rise to the top.

## Features

- List project folders from a configurable root directory.
- Search projects by folder name.
- Open projects in popular code editors.
- Switch the active editor from the command UI.
- Sort projects by usage.
- Reveal a project in Finder.
- Copy a project path.
- Open a project with another app when needed.

## Supported Editors

Open Project includes quick editor options for:

- Visual Studio Code
- Cursor
- Zed
- Windsurf
- Antigravity
- IntelliJ IDEA
- WebStorm
- PyCharm
- GoLand
- PhpStorm
- CLion
- Rider
- RubyMine
- Android Studio
- VSCodium
- Sublime Text
- Nova
- System Default

## Configuration

The command has two preferences:

- `Projects Directory`: the folder that contains your project folders. The default is `~/Desktop/pro`.
- `Editor`: the default editor used when opening a project.

You can also change the active editor directly from the command using the editor dropdown in the search bar or the `Change Editor` action.

## Usage

1. Open Raycast.
2. Search for `Open Project`.
3. Pick a project from the list.
4. Press Enter to open it in the selected editor.

The project list only includes direct child folders of the configured projects directory. For example, if the directory is `~/Desktop/pro`, then `~/Desktop/pro/my-app` appears as a project.

## Local Development

Install dependencies:

```bash
npm install
```

Run the extension in development mode:

```bash
npm run dev
```

Build the extension:

```bash
npm run build
```

Run type checking:

```bash
npx tsc --noEmit
```

## Notes

Usage history is stored locally with Raycast `LocalStorage`. It is used only to sort projects and is not synced or sent anywhere.

This first version intentionally keeps project discovery simple: every direct folder inside the configured directory is treated as a project.

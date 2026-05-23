import {
  Action,
  ActionPanel,
  Icon,
  List,
  LocalStorage,
  Toast,
  getPreferenceValues,
  open,
  showToast,
} from "@raycast/api";
import { access, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { useEffect, useMemo, useState } from "react";

type Project = {
  name: string;
  path: string;
  lastOpenedAt?: number;
  openCount: number;
};

type ProjectUsage = {
  lastOpenedAt: number;
  openCount: number;
};

type EditorValue = Preferences.OpenProject["editor"];

type Editor = {
  title: string;
  value: EditorValue;
};

const USAGE_STORAGE_KEY = "project-usage";
const SELECTED_EDITOR_STORAGE_KEY = "selected-editor";

const EDITORS: Editor[] = [
  { title: "Visual Studio Code", value: "Visual Studio Code" },
  { title: "Cursor", value: "Cursor" },
  { title: "Zed", value: "Zed" },
  { title: "Windsurf", value: "Windsurf" },
  { title: "Antigravity", value: "Antigravity" },
  { title: "IntelliJ IDEA", value: "IntelliJ IDEA" },
  { title: "WebStorm", value: "WebStorm" },
  { title: "PyCharm", value: "PyCharm" },
  { title: "GoLand", value: "GoLand" },
  { title: "PhpStorm", value: "PhpStorm" },
  { title: "CLion", value: "CLion" },
  { title: "Rider", value: "Rider" },
  { title: "RubyMine", value: "RubyMine" },
  { title: "Android Studio", value: "Android Studio" },
  { title: "VSCodium", value: "VSCodium" },
  { title: "Sublime Text", value: "Sublime Text" },
  { title: "Nova", value: "Nova" },
  { title: "System Default", value: "default" },
];

export default function Command() {
  const preferences = getPreferenceValues<Preferences.OpenProject>();
  const configuredProjectsDirectory = expandHome(preferences.projectsDirectory);
  const [selectedEditor, setSelectedEditor] = useState(preferences.editor);
  const editor = getEditorApplication(selectedEditor);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    LocalStorage.getItem<string>(SELECTED_EDITOR_STORAGE_KEY).then((storedEditor) => {
      if (isEditorValue(storedEditor)) {
        setSelectedEditor(storedEditor);
      }
    });
  }, []);

  useEffect(() => {
    loadProjects(configuredProjectsDirectory)
      .then(setProjects)
      .catch((error) => {
        showToast({
          style: Toast.Style.Failure,
          title: "Could not load projects",
          message: error instanceof Error ? error.message : String(error),
        });
      })
      .finally(() => setIsLoading(false));
  }, [configuredProjectsDirectory]);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (b.openCount !== a.openCount) {
        return b.openCount - a.openCount;
      }

      return (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0) || a.name.localeCompare(b.name);
    });
  }, [projects]);

  async function openProject(project: Project) {
    try {
      await open(project.path, editor);
      await updateProjectUsage(project);
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Could not open project",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function updateProjectUsage(project: Project) {
    const updatedProject = await recordProjectUsage(project);

    setProjects((currentProjects) =>
      currentProjects.map((currentProject) =>
        currentProject.path === updatedProject.path ? updatedProject : currentProject,
      ),
    );
  }

  async function changeEditor(editor: EditorValue) {
    setSelectedEditor(editor);
    await LocalStorage.setItem(SELECTED_EDITOR_STORAGE_KEY, editor);
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search projects"
      searchBarAccessory={
        <List.Dropdown
          tooltip="Editor"
          value={selectedEditor}
          onChange={(editor) => changeEditor(editor as EditorValue)}
        >
          {EDITORS.map((editor) => (
            <List.Dropdown.Item key={editor.value} title={editor.title} value={editor.value} />
          ))}
        </List.Dropdown>
      }
    >
      {sortedProjects.map((project) => (
        <List.Item
          key={project.path}
          title={project.name}
          subtitle={project.path}
          icon={Icon.Folder}
          accessories={[
            {
              text: project.openCount > 0 ? `${project.openCount} opens` : "New",
            },
          ]}
          actions={
            <ActionPanel>
              <Action title="Open Project" icon={Icon.ArrowRight} onAction={() => openProject(project)} />
              <ActionPanel.Section title="Editor">
                <ActionPanel.Submenu title="Change Editor…" icon={Icon.Gear}>
                  {EDITORS.map((editor) => (
                    <Action
                      key={editor.value}
                      title={editor.title}
                      icon={selectedEditor === editor.value ? Icon.CheckCircle : Icon.Code}
                      onAction={() => changeEditor(editor.value)}
                    />
                  ))}
                </ActionPanel.Submenu>
                <Action.OpenWith
                  title="Open with Another App"
                  path={project.path}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "o" }}
                  onOpen={() => {
                    updateProjectUsage(project);
                  }}
                />
              </ActionPanel.Section>
              <Action.ShowInFinder path={project.path} />
              <Action.CopyToClipboard title="Copy Path" content={project.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function getEditorApplication(editor: string) {
  if (editor === "default") {
    return undefined;
  }

  return editor;
}

function isEditorValue(editor: string | undefined): editor is EditorValue {
  return EDITORS.some((availableEditor) => availableEditor.value === editor);
}

async function loadProjects(projectsDirectory: string): Promise<Project[]> {
  const usage = await getProjectUsage();
  const readableProjectsDirectory = await getReadableProjectsDirectory(projectsDirectory);
  const entries = await readdir(readableProjectsDirectory, { withFileTypes: true });

  return entries
    .filter((entry) => (entry.isDirectory() || entry.isSymbolicLink()) && !entry.name.startsWith("."))
    .map((entry) => {
      const projectPath = join(readableProjectsDirectory, entry.name);
      const projectUsage = usage[projectPath];

      return {
        name: entry.name,
        path: projectPath,
        lastOpenedAt: projectUsage?.lastOpenedAt,
        openCount: projectUsage?.openCount ?? 0,
      };
    });
}

async function getReadableProjectsDirectory(projectsDirectory: string) {
  try {
    await access(projectsDirectory);
    return projectsDirectory;
  } catch {
    const desktopDirectory = join(homedir(), "Desktop");
    await access(desktopDirectory);
    return desktopDirectory;
  }
}

async function recordProjectUsage(project: Project): Promise<Project> {
  const usage = await getProjectUsage();
  const previousUsage = usage[project.path];
  const projectUsage = {
    lastOpenedAt: Date.now(),
    openCount: (previousUsage?.openCount ?? 0) + 1,
  };

  await LocalStorage.setItem(
    USAGE_STORAGE_KEY,
    JSON.stringify({
      ...usage,
      [project.path]: projectUsage,
    }),
  );

  return {
    ...project,
    ...projectUsage,
  };
}

async function getProjectUsage(): Promise<Record<string, ProjectUsage>> {
  const storedUsage = await LocalStorage.getItem<string>(USAGE_STORAGE_KEY);

  if (!storedUsage) {
    return {};
  }

  try {
    return JSON.parse(storedUsage) as Record<string, ProjectUsage>;
  } catch {
    return {};
  }
}

function expandHome(path: string) {
  if (path === "~") {
    return homedir();
  }

  if (path.startsWith("~/")) {
    return resolve(homedir(), path.slice(2));
  }

  return resolve(path);
}

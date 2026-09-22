# Capture Test

Tool: GitHub Copilot in VS Code

Model: `Auto` (session metadata reports family `claude-fable-5.1`); this agent has no separate planning and execution model.

Mechanism: `tools/agent-capture.ps1` watches VS Code's persisted `chatSessions` JSONL records and writes completed prompt/response pairs to `.agent-logs/`. VS Code does not expose a repo-configurable prompt or end-of-turn hook for Copilot, so the watcher must be started automatically by the developer environment or run as a background process for the session.

Config checked: VS Code workspace storage under `%APPDATA%\Code\User\workspaceStorage`; no Copilot lifecycle hook configuration was present.

Canary log path: `.agent-logs/`

Canary entries: pending an actual user-issued canary prompt. This agent cannot initiate a second Copilot session or send a prompt to itself, so the two-session verification cannot honestly be completed from inside this conversation.

What did not work: the Copilot transcript JSONL contains assistant and tool events but not the raw user prompt; the prompt is stored in the separate `chatSessions` database, which is why the watcher reads that source instead.
<p align="center">
  <img src="/images/logo.png?raw=true" width="128" alt="StickyCommand Logo">
</p>

<h1 align="center">StickyCommand</h1>

<p align="center">
  Lightweight desktop command launcher and terminal output monitor for local development workflows.
</p>

<p align="center">
  Save recurring commands, organize them into groups, run them with one click, and monitor output in real time.
</p>

---

# Overview

StickyCommand is a modernized continuation of the original Command Pad project.

The original application provided a simple but effective way to manage frequently used development commands from a desktop interface. However, the upstream project had been inactive for nearly a decade, and parts of the infrastructure and ecosystem were no longer compatible with modern environments.

This repository is a maintained fork focused on stability, usability, and compatibility improvements while preserving the lightweight workflow developers appreciated in the original project.

Repository:  
[StickyCommand GitHub Repository](https://github.com/mesutpiskin/stickycommand?utm_source=chatgpt.com)

Original project:  
[Command Pad (Original Repository)](https://github.com/supnate/command-pad?utm_source=chatgpt.com)

Screen Shot:

  <img src="/images/ss.png?raw=true" width="256" alt="StickyCommand SS">

---

# Why This Fork Exists

The original Command Pad project has not been actively maintained for approximately 10 years.

Over time:

- Some external links and dependencies became unavailable
- Modern Node.js and macOS environments introduced compatibility issues
- The packaging/build pipeline became outdated
- Several quality-of-life improvements were missing for modern development workflows

StickyCommand was created to keep the project alive, modernize critical parts of the application, and continue improving the developer experience.

---

# Key Improvements

- Complete rebranding from **Command Pad** to **StickyCommand**
- Improved compatibility with modern Node.js and macOS environments
- Stabilized command execution flow
- Removed or replaced broken upstream resources
- Added command grouping support
- Improved maintainability for future development

---

# Features

## Command Launcher

- Save frequently used terminal commands
- Execute commands with a single click
- Start and stop processes directly from the desktop UI

## Real-Time Output Monitoring

- Monitor command output in real time
- Colorized logs for better readability
- Quickly inspect active development processes

## Command Organization

- Group commands for cleaner workspace management
- Organize services, environments, or projects efficiently

## Productivity Enhancements

- Optional finish notifications
- Optional command URL shortcuts  
  (e.g. local development server links)


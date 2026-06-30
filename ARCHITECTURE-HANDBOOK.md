# Architecture Handbook

## Overview
The system is structured as a layered architecture with a central music engine at its core.

## Layers
- UI Layer: browser-based interface only
- Application Layer: commands and interaction logic
- Engine Layer: core music model and rules
- Storage Layer: persistence and serialization

## Core Rule
The engine does not know about the UI. It only understands music data and commands.

## Command System
All edits are represented as commands (insert note, delete note, transpose, etc.). Commands are reversible and form the basis of undo/redo.

## Rendering
Rendering systems read from the engine state but never modify it.

## Extensibility
Modules must remain independent and communicate through defined interfaces.

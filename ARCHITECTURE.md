# Architecture Overview

Harmony Engine is built around a central canonical music model.

## System Structure

UI Layer
→ Application Layer
→ Music Engine
→ Storage Layer

## Music Engine
The engine is the source of truth. It contains all musical data including notes, timing, structure, and metadata.

## Views
Multiple views can represent the same data:
- Tab editor
- Notation view
- Playback view
- Analysis tools

## Data Flow
User input is converted into commands, which modify engine state. The UI only renders state.

## Goal
Maintain a single source of truth for all musical information while allowing multiple synchronized representations.

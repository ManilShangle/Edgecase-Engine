# EdgeCase Engine

EdgeCase Engine is a web app built for competitive programmers to quickly generate, organize, and reuse edge-case test inputs for coding contest problems. Instead of guessing tricky cases or manually writing tests, users define problem constraints and let the system produce structured, contest-realistic edge cases that expose common failure patterns.

This project is built **exclusively with MongoDB Atlas** as the external persistence layer and is designed to work without any AI models or code execution.

---

## What Problem This Solves

In coding competitions, most wrong answers and TLEs come from missed edge cases, not bad algorithms. Writing and managing those edge cases manually is slow, error-prone, and not reusable.

EdgeCase Engine:
Automates edge-case generation from constraints
Structures edge cases by failure type
Lets hackers reuse what actually breaks solutions
Saves time during contests and practice

---

## Core Features

### Problem Setup
Create a problem with tags, constraints, and input shape
Supports arrays, strings, graphs, trees, DP, greedy, binary search, and more
Handles single-test and multi-test formats

### Deterministic Edge-Case Generator
Template-driven generation (no AI required)
Boundary cases (min/max sizes and values)
Degenerate cases (all same values, zeros, duplicates)
Adversarial patterns (ordering traps, alternating values)
Performance-heavy cases
Graph-specific structures (disconnected, dense, star, path, tree)

### Edge-Case Library
All testcases stored in MongoDB Atlas
Tag each testcase by:
  - category (boundary, degenerate, adversarial, etc.)
  - target pitfall (overflow, off-by-one, duplicates, reset bug, TLE)
Pin important testcases
Mark cases that caused WA/TLE/MLE

### Search & Filtering
Filter testcases by category or target pitfall
Full-text search on testcase content and notes
Quickly find “that one case that always breaks solutions”

### Export & Copy
Export all testcases as:
  - single combined input
  - one testcase per file
Automatically formats multi-test inputs
Copy-paste friendly output for local runners

### Guest Mode
No account required
Guest sessions stored via a generated ID
All data still persists in MongoDB

---

## Why This Is Different

Most tools try to **solve problems for you**.  
EdgeCase Engine helps you **lose less** by attacking your assumptions.

It focuses on:
Failure patterns instead of solutions
Deterministic, explainable test generation
Reusability across problems and contests

This makes it a real tool hackers would keep open while coding.

---

## Tech Stack

**Frontend:** React (or any modern JS framework)
**Backend:** FastAPI or Express
**Database:** MongoDB Atlas (Free Tier)
**Auth:** Guest sessions (localStorage + MongoDB)
**Hosting:** Any platform (local, Cloudflare, Render, etc.)

MongoDB is the only required external service.

---

## MongoDB Collections

problems – problem metadata, constraints, tags
testcases – generated and manual edge cases
guests – guest session tracking
templates (optional) – reusable generation templates

All edge-case metadata is stored as flexible documents to allow fast iteration.

---

## Typical Workflow

1. Create a new problem
2. Define constraints and tags
3. Generate edge cases
4. Save the useful ones
5. Export and test locally
6. Mark which cases break your solution
7. Reuse the same patterns next time

---

## Demo Mode

The app includes a seeded demo dataset with:
Sample problems
Pre-generated edge cases
Common contest pitfalls

This allows instant testing without setup.

---

## Future Extensions

Community-shared edge-case templates
Public problem libraries
Import from pasted problem statements
Lightweight analytics on common failure types

---

## License

MIT License

---

Built for hackers who are tired of losing to invisible test cases.
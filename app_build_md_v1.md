# AloAI Tech Interviewer: Build Instructions

## Your role
You are a senior full-stack engineer and product designer building the first version of AloAI, a web application. Build only the features described below. Do not add features, pages, or functionality that are not listed here.

## Product overview
AloAI is a web application that helps software engineers prepare for **senior-level Python technical interviews**. Users answer highly specialized Python questions organized into game-style levels. Alo, an AI tutor, guides them through the experience.

**Core value proposition (use this in copy and messaging):** AloAI is the way to ace senior Python technical interviews, with questions curated by expert Python software engineers.

## Key component: Alo, the AI tutor
- Alo is the app's tutor and guide. She appears throughout the app as a **female avatar**.
- Alo guides the user through each level of questions.
- For each level, Alo explains **why** the user should learn that content, connecting it to what senior interviewers look for.
- Alo awards credits when the user passes questions and levels (see "Credits" below).

## Design requirements
- The whole app should look and feel like a **modern game**: beautiful, polished, contemporary UI and UX.
- Use game-style visuals for levels, progression, locked and unlocked states, and rewards.
- Visual quality is a primary requirement, not an afterthought. Prioritize clear hierarchy, smooth transitions, and a cohesive visual identity.

## User workflow (build in this order)

### 1. Landing page
- Gamified, modern, visually striking design with dynamic content (for example, animation or interactive elements).
- Present AloAI as the solution for acing Python technical interviews.
- Clearly communicate that the questions are **curated by expert Python software engineers**.
- Introduce Alo as the user's tutor.
- Include a clear call to action to sign up or log in.

### 2. Authentication
- Users can sign up and log in.

### 3. Placement test
- After signing up, the user takes a placement test of Python questions.
- The test determines the user's current Python seniority level.

### 4. Level assignment
- Based on the placement test result, assign the user a starting level.
- The user begins answering questions from that level.

### 5. Level progression and credits
- **Levels are locked.** A user cannot see or access a level until they complete the previous one (e.g., if Level 1 is not completed, Level 2 is not visible).
- **Credits:** For each question and each level the user passes, Alo awards credits.
- Credits must be presented in a **highly visually attractive** way (for example, an animated reward moment), consistent with the game aesthetic.

## Messaging requirement
Throughout the app (landing page and in-app), communicate that the questions are curated by expert Python software engineers.

## How to work
1. **Before writing code**, review these requirements and list any decisions that are not specified here, such as tech stack, data storage, number of levels, the source and format of the question content, and how Alo's guidance text is produced. Ask me about them instead of assuming.
2. After I answer, propose a short implementation plan (architecture, main pages, data model) and wait for my approval.
3. Build incrementally, following the workflow order above. After each major step, summarize what was built and how to run it.
4. Keep the scope exactly to what is described in this document.

## Definition of done
- A user can go from the landing page through sign up, take the placement test, be assigned a level, answer questions, and earn credits.
- Locked levels cannot be viewed or accessed until the previous level is completed.
- Alo appears as the guide throughout and explains why each level's content matters.
- The "curated by expert Python software engineers" message is visible.
- The UI is consistently gamified, modern, and polished.
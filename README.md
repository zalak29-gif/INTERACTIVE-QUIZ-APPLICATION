# QUIZ-PINBOARD - INTERACTIVE-QUIZ-APPLIACATION

*COMPANY*: CODTECH IT SOLUTIONS

*NAME*: PARMAR ZALAK KANTILAL

*INTERN ID*: CTIS4007

*DOMAIN*: FRONT END DEVELOPMENT

*DURATION*: 4 WEEKS

*MENTOR*: NEELA SANTOSH

# Quiz Pinboard is a browser-based quiz platform designed as a multi-genre quiz hub with subcategory-based gameplay, scoring, timer logic, and a persistent performance dashboard.
Based on the current codebase, this project is implemented as a static frontend application using HTML, CSS, and vanilla JavaScript, with no server dependency required for core functionality.
It runs directly in the browser and stores user progress in localStorage, making it lightweight and easy to launch from any local or hosted static environment.
From a completed-task perspective, Quiz Pinboard already includes the key functional blocks expected in a polished quiz prototype.
The home page is complete with a category selection grid generated from JavaScript data (data-categories.js and home.js).
Instead of hardcoding category cards in HTML, the app validates and renders them dynamically, which is a good sign of structured data-driven design.
A Dashboard section is also implemented on the same home screen, showing attempt history, best score, best percentage, and last played timestamp per genre/subcategory pair.
This data is sorted by recency and summarized with a total attempt count, so users can review learning history.

The quiz gameplay layer is also fully implemented. Each genre page (anime, books, coding, games, movies, studies) loads a common runtime engine (genre-runtime.js) plus genre-specific config and question bank files.
This architecture is modular: config-*.js maps metadata (genre key/name/subtitle) and points to data-*.js, while runtime logic remains shared.
Inside the runtime, users first select a subcategory, then start randomized questions with shuffled answer options.
The app enforces question schema validity before use, so malformed question entries are filtered out safely.

A timed quiz loop is complete and functional. Every question has a 15-second timer, visual timer state changes, answer locking, next-question progression, and timeout handling.
Scoring combines base points and speed bonus, so faster correct answers earn more. Accuracy, live score, question progress, and progress bar all update in real time.
At quiz end, a result screen displays score, correctness breakdown (correct/incorrect/timed out), completion message, and actions to replay or switch subcategory.

Persistence is implemented through localStorage with a stable key (quiz_universe_scores). After each run, attempts and best metrics are updated per genre-subcategory combination.
This makes the app feel like a personal practice tool instead of a one-off quiz session.
Platform-wise, this project runs on any modern browser and can be served using XAMPP/Apache, VS Code Live Server, or direct file hosting.
There is no Node build tool or backend runtime requirement in the current version.

Languages and technologies used are HTML5, CSS3, and JavaScript (ES6-style browser scripting).
The overall implementation shows completed work in UI structure, gameplay logic, validation, state transitions, results processing, and persistent analytics at local-browser level.

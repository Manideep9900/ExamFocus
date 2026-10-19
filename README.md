<div align="center">

# ExamFocus

### Study Smarter. Prepare Strategically. Score Better.

An AI-powered exam preparation platform that analyzes previous question papers, identifies recurring topics, and helps students prioritize their revision.

<br>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?logo=googlegemini&logoColor=white)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?logo=render&logoColor=black)

<br>

[Features](#features) ·
[How It Works](#how-it-works) ·
[Tech Stack](#tech-stack) ·
[Architecture](#architecture) ·
[Getting Started](#getting-started) ·
[Deployment](#deployment) ·
[Security](#security) ·
[Future Improvements](#future-improvements)

</div>

---

## About the Project

**ExamFocus** is a full-stack web application designed to help students prepare more strategically for examinations.

Students often spend considerable time reviewing previous question papers without knowing which topics deserve the most attention. ExamFocus uses AI to analyze uploaded papers, group related questions, identify recurring topics, and generate revision insights.

The goal is to help students make better use of their preparation time by understanding patterns in previous examination papers.

## Screenshots

# Homepage

<img width="1517" height="718" alt="Screenshot 2026-10-19 002311" src="https://github.com/user-attachments/assets/7c18f327-c3fc-4c1d-961b-d29ffdceaad0" />

## Dashboard 

<img width="1512" height="727" alt="Screenshot 2026-10-19 175103" src="https://github.com/user-attachments/assets/7e186034-cee4-4da7-895c-158eedf7cfab" />
<img width="1520" height="730" alt="Screenshot 2026-10-19 175151" src="https://github.com/user-attachments/assets/a97d66f2-03db-4340-9793-02012d02fd6d" />

## Features

- **AI-Powered Paper Analysis** — Analyze uploaded question papers using the Google Gemini API.
- **Recurring Topic Detection** — Identify topics that appear across multiple question papers.
- **Question Grouping** — Organize related questions into meaningful groups.
- **Revision Insights** — Help students prioritize topics based on patterns found in uploaded papers.
- **User Authentication** — Register, log in, and access a personal account.
- **Saved Analysis History** — Revisit previously generated analyses.
- **PDF and Image Uploads** — Upload supported examination papers in PDF, JPG, and PNG formats.
- **Daily Analysis Limit** — Restrict the number of analyses a user can perform each day.
- **Theme Support** — Switch between available interface themes.
- **Cloud Database** — Store user accounts and analysis history in PostgreSQL.

## How It Works

1. **Create an account:** Register and log in to ExamFocus.
2. **Upload question papers:** Select previous examination papers in PDF or supported image formats.
3. **Analyze the papers:** The backend sends the required content to the Google Gemini API.
4. **Process the results:** The application organizes related questions and identifies recurring topics.
5. **Review the insights:** Examine the generated results and use them to prioritize revision.
6. **Access saved analyses:** Return to previous analyses through your saved history.

## Tech Stack

| Layer             | Technologies                     |
| ----------------- | -------------------------------- |
| Frontend          | React, JavaScript, Vite, CSS     |
| Backend           | Node.js, Express.js              |
| Database          | PostgreSQL, Neon                 |
| AI Integration    | Google Gemini API                |
| Authentication    | JWT, bcryptjs, HTTP-only cookies |
| File Uploads      | Multer                           |
| Development Tools | npm, Git, VS Code                |
| Deployment        | Render                           |
| Version Control   | GitHub                           |

## Architecture

```text
                       Student
                          |
                          v
                   Web Browser
                          |
                          v
                  React Frontend
                          |
                     HTTP Requests
                          |
                          v
                   Express Server
                    /           \
                   /             \
                  v               v
          Google Gemini API   Neon PostgreSQL
             AI Analysis      Persistent Data
```

### Deployment Architecture

The React frontend and Express backend are deployed together in a single Render Web Service.

- **React:** Provides the user interface.
- **Express:** Handles API requests, authentication, analysis workflows, and serves the production frontend.
- **Neon:** Provides the managed PostgreSQL database.
- **Google Gemini:** Powers AI-based question-paper analysis.
- **Render:** Hosts the application.
- **GitHub:** Stores the source code.

During production builds, Vite generates the frontend files inside `client/dist`. The Express server serves these files alongside the backend API.

## Project Structure

```text
ExamFocus/
|
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- App.jsx
|   |   |-- api.js
|   |   |-- main.jsx
|   |   |-- styles.css
|   |   |-- theme.js
|   |
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|
|-- server/
|   |-- src/
|   |   |-- config.js
|   |   |-- db.js
|   |   |-- auth.js
|   |   |-- analyze.js
|   |   |-- gemini.js
|   |   |-- index.js
|   |
|   |-- .env.example
|   |-- package.json
|   |-- package-lock.json
|
|-- .gitignore
|-- README.md
```

## Getting Started

Follow these instructions to run ExamFocus locally.

### Prerequisites

Install the following tools and obtain the required credentials:

- [Node.js](https://nodejs.org/) version 20 or later
- npm, included with Node.js
- A [Neon PostgreSQL](https://neon.tech/) database
- A [Google Gemini API key](https://aistudio.google.com/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Manideep9900/ExamFocus.git
cd ExamFocus
```

If the repository is private, you must have permission to access it.

### 2. Install Backend Dependencies

Open a terminal in the project root and run:

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a file named `.env` inside the `server` directory.

Add the following configuration:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-lite-latest
DAILY_ANALYSES_PER_USER=5
```

Replace the example values with your actual credentials.

| Variable                  | Description                                 |
| ------------------------- | ------------------------------------------- |
| `PORT`                    | Port used by the Express server locally     |
| `NODE_ENV`                | Application environment                     |
| `DATABASE_URL`            | Neon PostgreSQL connection string           |
| `JWT_SECRET`              | Secret used to sign authentication tokens   |
| `GEMINI_API_KEY`          | Google Gemini API key                       |
| `GEMINI_MODEL`            | Gemini model used for analysis              |
| `DAILY_ANALYSES_PER_USER` | Maximum analyses permitted per user per day |

**Important:** Never upload your actual `.env` file or expose your database credentials, JWT secret, or Gemini API key.

### 4. Start the Backend

From the `server` directory, run:

```bash
npm run dev
```

The Express server starts on port `3001` by default.

Keep this terminal running.

### 5. Install Frontend Dependencies

Open a second terminal at the project root.

Run:

```bash
npm install --prefix client
```

### 6. Start the Frontend

From the project root, run:

```bash
npm run dev --prefix client
```

Vite displays a local development URL in the terminal. Open that URL in your browser.

The URL is typically:

```text
http://localhost:5173
```

The frontend communicates with the backend through the API proxy configured in `client/vite.config.js`.

### 7. Build the Frontend

To generate the production frontend files, run this command from the project root:

```bash
npm run build --prefix client
```

Vite generates the production build in:

```text
client/dist/
```

The Express server serves these files in production.

## Deployment

ExamFocus is deployed using Render, Neon PostgreSQL, and Google Gemini.

### Services Used

| Service            | Purpose                           |
| ------------------ | --------------------------------- |
| Render Web Service | Hosts the frontend and backend    |
| Neon PostgreSQL    | Stores application data           |
| Google Gemini API  | Analyzes uploaded question papers |
| GitHub             | Hosts the source repository       |

### Deploying to Render

The following instructions describe the deployment configuration used for this project.

#### 1. Push Your Code to GitHub

Commit your changes and push them to the repository:

```bash
git add .
git commit -m "Update project"
git push
```

Only commit files that are safe to publish. Never commit secrets, private exam papers, or your actual `.env` file.

#### 2. Create a Web Service

1. Sign in to Render.
2. Create a new Web Service.
3. Connect the GitHub repository.
4. Select the `main` branch.
5. Leave the Root Directory empty so Render uses the repository root.

#### 3. Configure the Build Command

Use the following command:

```bash
npm ci --prefix server && npm ci --prefix client && npm run build --prefix client
```

This installs backend dependencies, installs frontend dependencies, and builds the React application.

#### 4. Configure the Start Command

Use:

```bash
npm start --prefix server
```

This starts the Express server.

#### 5. Configure Environment Variables

In your Render service, open the Environment section and configure:

| Variable                  | Value                                     |
| ------------------------- | ----------------------------------------- |
| `NODE_ENV`                | `production`                              |
| `DATABASE_URL`            | Your Neon PostgreSQL connection string    |
| `JWT_SECRET`              | A strong random secret                    |
| `GEMINI_API_KEY`          | Your Google Gemini API key                |
| `GEMINI_MODEL`            | The model configured for your application |
| `DAILY_ANALYSES_PER_USER` | Your chosen daily analysis limit          |

Render supplies the `PORT` environment variable to the application.

Do not upload your local `.env` file to GitHub.

#### 6. Deploy

1. Save the Render configuration.
2. Trigger a deployment.
3. Review the build and startup logs.
4. Wait until the service reports that it is live.
5. Open the public URL provided by Render.

#### 7. Verify the Live Application

After deployment, test:

- User registration and login.
- Uploading and analyzing question papers.
- Displaying analysis results.
- Saving analysis history.
- Refreshing the application.
- Logging out and logging back in.
- Retrieving previously saved analyses.

**Free-tier note:** Depending on the hosting plan, a service may sleep after inactivity. The first request after a period of inactivity can take longer.

## Security

ExamFocus uses several security-related measures:

- Password hashing using bcryptjs.
- JWT-based authentication.
- HTTP-only authentication cookies.
- Configured file-upload type and size restrictions.
- Environment variables for sensitive credentials.
- PostgreSQL connections configured for SSL certificate verification.
- Daily analysis limits to restrict usage.

Security is an ongoing process. Before making an application widely available, review authentication, file-upload validation, rate limiting, error handling, dependency updates, and third-party API data handling.

## Future Improvements

Potential future improvements include:

- More detailed topic-frequency analytics.
- Personalized revision scheduling.
- Exportable study plans and analysis reports.
- Improved question-paper processing.
- More comprehensive automated testing.
- Additional exam preparation insights.

## Author

**Manideep**

GitHub: [Manideep9900](https://github.com/Manideep9900)

Project Repository: [ExamFocus](https://github.com/Manideep9900/ExamFocus)

---

<div align="center">

Built to help students prepare smarter with AI.

</div>

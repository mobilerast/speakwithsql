
# SpeakWithSQL

SpeakWithSQL is a simple Node.js + Express demo that lets you ask questions in plain English and get SQL queries as answers, powered by OpenAI. It’s designed to show how natural language can be used to generate SQL for real-world databases.

## Demo

![Demo GIF](https://github.com/user-attachments/assets/e79360c7-1968-46ca-a1ac-d98622e567c1)

## Features

- Convert natural language questions to SQL queries using OpenAI
- Choose your SQL dialect (SQLite, PostgreSQL, MySQL, MSSQL)
- Modern, clean chat interface (with avatars and responsive design)
- Few-shot prompt engineering for better SQL quality
- Example academic/research database schema and dummy data
- Modular backend (Express, controllers, routes, services)

## How It Works

1. Type a question in the chat (e.g., "List all users and their ORCID numbers.")
2. Select your SQL dialect
3. The backend sends your question and schema to OpenAI
4. OpenAI returns a SQL query, which is shown in the chat

## Getting Started

**Prerequisites:**
- Node.js (v18 or later)
- An OpenAI API key ([get one here](https://platform.openai.com/account/api-keys))

**Installation:**
1. Clone the repository:
   ```sh
   git clone https://github.com/mobilerast/speakwithsql.git
   cd speakwithsql
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Add your OpenAI API key to a `.env` file:
   ```env
   OPENAI_API_KEY=sk-...
   ```
4. (Optional) Set up your SQL database using `dummy_data.sql`.

**Running the App:**
```sh
npm run dev
# or
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Example Questions

- List all users and their ORCID numbers.
- Show the names of users and the universities they are affiliated with, only for users from Boğaziçi Üniversitesi.
- How many publications does each user have? List user names with their publication counts.
- List all publications from the year 2024 with their titles and citation counts.

## Project Structure

```
speakwithsql/
 ├── package.json
 ├── server.js
 ├── controllers/
 │    └── chatController.js
 ├── routes/
 │    └── chatRoutes.js
 ├── services/
 │    └── openaiService.js
 ├── public/
 │    └── index.html
 ├── dummy_data.sql
 ├── .env
 └── .gitignore
```

## Author

Mehmet Alp ([mehmet.alp@rastmobile.com](mailto:mehmet.alp@rastmobile.com))

## Repository

GitHub: https://github.com/mobilerast/speakwithsql

## About Rastmobile AI Solutions

Learn more: https://rastmobile.com/en/services/ai-server-llm-services

## Disclaimer

This project is for demonstration and prototyping purposes. It does not execute SQL queries by default. Always review generated SQL before running it on your database.

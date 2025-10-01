# SpeakWithSQL

A realistic Node.js + Express application that lets users ask questions in natural language and receive SQL queries as responses, powered by OpenAI. Designed for developers, researchers, and data teams who want to quickly generate SQL from plain English, with a focus on academic and research data.

## Features
- Converts user questions into SQL queries using OpenAI's API
- Sends database schema metadata to OpenAI for accurate SQL generation
- Clean chat interface for interaction
- Modular backend (Express, controllers, routes, services)
- Example SQL schema and dummy data for academic/research use cases
- Ready for integration with any SQL database (SQLite, PostgreSQL, MySQL, etc.)

## How It Works
1. User types a question in the chat interface (e.g., "List all users who published in 2024").
2. The backend sends the question and database schema metadata to OpenAI.
3. OpenAI returns a SQL query as a response.
4. The SQL is shown to the user (not executed by default).

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- An OpenAI API key ([get one here](https://platform.openai.com/account/api-keys))

### Installation
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

### Running the App
- Start the server:
  ```sh
  npm run dev
  # or
  npm start
  ```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

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
- Mehmet Alp ([mehmet.alp@rastmobile.com](mailto:mehmet.alp@rastmobile.com))

## Repository
- GitHub: https://github.com/mobilerast/speakwithsql

## About Rastmobile AI Solutions
- Learn more: https://rastmobile.com/en/services/ai-server-llm-services

## Disclaimer
- This project is for demonstration and prototyping purposes. It does not execute SQL queries by default. Always review generated SQL before running it on your database.

## Keywords
speak to sql, speak to db, sql generator, openai, natural language to sql, academic data, research data

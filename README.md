# Mugen-Porta

This project is a web application built with Next.js, featuring authentication, an admin dashboard, and an email notification system using a job queue.

## Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS 4
- **Database:** MySQL
- **Queue System:** Redis (BullMQ)
- **Authentication:** Custom JWT (JOSE)
- **Email:** Nodemailer

## Environment Variables

To run this project, you need to set up the following environment variables in your `.env` file.

### Database Configuration
- `DB_HOST`: The hostname of your MySQL database.
- `DB_USER`: The username for your MySQL database.
- `DB_PASSWORD`: The password for your MySQL database.
- `DB_NAME`: The name of the database to use.

### Email Configuration (SMTP)
- `SMTP_USER`: The email address used to send notifications.
- `SMTP_PASS`: The password for the email account.

### Redis Configuration (for Email Queue)
- `REDIS_HOST`: The hostname of your Redis server (default: localhost).
- `REDIS_PORT`: The port of your Redis server (default: 6379).
- `REDIS_PASSWORD`: The password for your Redis server.

### Security
- `TCK`: Secret key used for signing JWT tokens.

## Getting Started

1.  Navigate to the application directory:
    ```bash
    cd my-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  Set up your environment variables as described above.

4.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Application routes and pages.
- `src/lib`: Utility functions, database connections, and email queue logic.
- `src/components`: Reusable UI components.
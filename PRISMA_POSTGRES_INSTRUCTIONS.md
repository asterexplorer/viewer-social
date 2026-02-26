# Switching to PostgreSQL

The Prisma schema has been updated to use PostgreSQL. To complete the migration, follow these steps:

1.  **Update `.env`**:
    Change your `DATABASE_URL` in the `.env` file to your PostgreSQL connection string:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```
    Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your actual credentials.

2.  **Stop Development Server**:
    If `npm run dev` is running, stop it (Ctrl+C).

3.  **Generate Client**:
    Run the following command to regenerate the Prisma Client for PostgreSQL:
    ```bash
    npx prisma generate
    ```

4.  **Push Schema to Database**:
    Use `db push` to fast-forward your database schema (good for prototyping) or `migrate dev` for versioned migrations.
    ```bash
    npx prisma db push
    # OR
    npx prisma migrate dev --name init_postgres
    ```

5.  **Seed Database (Optional)**:
    If you want to populate it with the mock data:
    ```bash
    npx prisma db seed
    ```

6.  **Restart Server**:
    ```bash
    npm run dev --turbo
    ```

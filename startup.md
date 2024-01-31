# next.js-dashboard

## 概述

这是[官网示例](https://nextjs.org/learn/dashboard-app/getting-started)，我们会一步步构建一个dashboard web。

## 运行

Inside that directory, you can run several commands:

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Builds the app for production.

```bash
npm start
```

Runs the built app in production mode.

We suggest that you begin by typing:

```bash
cd nextjs-dashboard
npm run dev
```

## uuid作为表id

这不是next js决定的，而是postgres db决定的。这一定可以在seed.js创建数据库中看到。

```js
async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
```

## 可访问性

lint检查，这是一个类似于静态检查的东西
在package.json中添加

```json
"scripts": {
    "build": "next build",
    "dev": "next dev",
    "seed": "node -r dotenv/config ./scripts/seed.js",
    "start": "next start",
    "lint": "next lint"
},
```

命令

```bash
npm run lint
```

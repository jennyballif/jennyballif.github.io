# Chess Club — Frontend

This is the frontend for the Chess Club app — the files your students and teacher see in their browser.

These are pre-built static files. No installation or build tools required. You just edit one configuration file and upload the files to your web host.

The backend (the server that handles real-time communication) is set up separately. See the [chess-club-backend](https://github.com/sergeballif/chess-club-backend) repo.

![Chess Club App](https://raw.githubusercontent.com/sergeballif/chess-club-backend/main/ChessApp.gif)

---

## What you need

- A place to host static files (any web host works — Google Sites, Netlify, GitHub Pages, your school's server, etc.)
- Your own backend URL from Render (see the backend repo for instructions)

---

## Step 1 — Download these files

Click the green **Code** button on this GitHub page, then **Download ZIP**. Unzip the folder on your computer.

---

## Step 2 — Edit config.js

Open `config.js` in any text editor (Notepad, TextEdit, VS Code, etc.).

You will see:

```js
window.CHESS_CLUB_CONFIG = {
  socketUrl: 'https://your-backend.onrender.com',
  teacherPasswordEnabled: false
};
```

Make the following changes:

- Replace `https://your-backend.onrender.com` with the URL of your own Render backend
- Set `teacherPasswordEnabled: true` if you set a `TEACHER_PASSWORD` on your Render backend (recommended)

Save the file.

---

## Step 3 — Upload to your web host

Upload all the files to your web host. The folder structure should remain intact — do not move files around.

Your app is now live.

---

## How to use the app

- **Students** go to your site's main URL (e.g. `https://yourschool.com`)
- **Teacher** goes to `https://yourschool.com/teacher`

If `teacherPasswordEnabled` is set to `true`, the teacher will be prompted for the password when they navigate to `/teacher`. Students are not prompted for anything.

---

## Updating to a new version

When a new version of the frontend is released:

1. Download the new ZIP from this repo
2. Edit `config.js` again with your backend URL and password settings
3. Re-upload all files to your web host

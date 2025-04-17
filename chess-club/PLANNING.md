# Interactive Chess Club Livestream System - Project Plan and Specification

## 1. Project Overview
**Goal**: Develop a web-based application for an online chess club livestream, enabling real-time interaction between a teacher and students during chess puzzle sessions.

**Key Features**:
- **Teacher View**: Load chess positions via FEN, display aggregated student moves as transparent arrows with opacity-based popularity, toggle voting (enable/disable without resetting), and reset votes manually.
- **Student View**: View the current chess position, submit one move per voting round (retractable), and enter an optional nickname for identification.
- **Real-Time Sync**: Student view updates whenever the teacher moves a piece or loads a new FEN.
- **Scalability**: Host locally on an Apple Silicon MacBook for 50 students, with future scaling to 200+ on a cloud server (Heroku).
- **UI**: Clean, minimal design inspired by Lichess and Chess.com.

**Target Audience**: 50 students initially, scaling to 200+ later.  
**Platform**: Web-based, hosted locally with a cloud-ready design.

---

## 2. Requirements
### General
- **Hosting**: Local on Apple Silicon MacBook (macOS), with good internet speed. Future migration to Heroku for simplicity and low cost.
- **Scalability**: Supports 50 students locally, scales to 200+ on Heroku.
- **Development**: Built with HTML, CSS, JavaScript, and Node.js. React for frontend, beginner-friendly setup for someone new to JS/Node.js.

### Teacher View
- **URL**: `http://localhost:3000/teacher` (local) or `https://yourdomain.com/teacher` (cloud).
- **Layout**: 
  - Left 70%: Chessboard (large, centered within its section).
  - Right 30%: FEN input field, buttons, and move list (vertical stack, Chess.com-style).
- **Features**:
  - **Load FEN**: Text input to paste a FEN string, updating the board and broadcasting to students.
  - **Move Pieces**: Drag pieces on the board to update the position, syncing with students.
  - **Student Moves**: Displayed as arrows with opacity scaled to popularity (full opacity for most popular, decreasing for less popular).
  - **Move List**: Shows aggregated votes (e.g., "e4: 5 votes, d4: 3 votes"). Mouseover on a move shows a tooltip with student nicknames who voted for it.
  - **Voting Toggle**: Enable/disable student voting without resetting votes.
  - **Reset Votes**: Button to clear all student votes and allow new submissions.
- **UI Design**: Clean, minimal, Lichess-like (white background, dark pieces, simple buttons).

### Student View
- **URL**: `http://localhost:3000/student` (local) or `https://yourdomain.com/student` (shared with students).
- **Layout**: 
  - Chessboard centered on the page.
  - Nickname input and status message below the board.
- **Features**:
  - **View Position**: Displays the current teacher position, updating in real-time on FEN load or piece move.
  - **Move Submission**: When voting is enabled, drag a piece to submit one move. Students can retract and resubmit a different move until voting is disabled or votes are reset.
  - **Nickname**: Optional text input for students to enter a name (stored with their move).
  - **Feedback**: Shows "Submit your move", "Move submitted: e4", or "Voting closed" based on state.
- **Constraints**:
  - One move per student per voting round (resettable by teacher).
  - No login required; anonymous participation with nickname option.
- **UI Design**: Clean, minimal, Lichess-like.

### Backend
- **Real-Time**: WebSockets (Socket.IO) for instant updates (FEN, moves, voting status).
- **Data**:
  - Store current FEN, voting status, and student moves (with nicknames).
  - Local: In-memory object.
  - Cloud: Redis for scalability.
- **Logic**:
  - Validate moves and FENs using Chess.js.
  - Aggregate votes and calculate arrow opacity (e.g., max votes = 1.0 opacity, others scaled proportionally).

---

## 3. Technical Architecture
### Tech Stack
- **Frontend**:
  - **React**: Component-based UI (simplified for JS beginners with templates).
  - **Chess.js**: Chess logic and FEN parsing.
  - **chessboardjsx**: Chessboard rendering.
  - **chessboard-arrows**: Arrow overlays for student moves.
  - **Socket.IO Client**: Real-time updates.
  - **HTML/CSS**: Static structure and styling.
- **Backend**:
  - **Node.js/Express**: API and server.
  - **Socket.IO**: WebSocket communication.
  - **Chess.js**: Server-side validation.
  - **In-memory Store**: Local data (JS object).
  - **Redis**: Cloud data (Heroku add-on).
- **Tools**:
  - **Vite**: Fast React build tool.
  - **Git/GitHub**: Version control.
  - **ngrok**: Temporary public URL for local testing.

### Architecture
- **Frontend**:
  - Teacher View: React app with chessboard (70%) and controls (30%).
  - Student View: React app with centered chessboard and input/status.
- **Backend**:
  - REST API for move submission and state retrieval.
  - WebSocket events for real-time sync.
- **Hosting**:
  - Local: Node.js on MacBook, `ngrok` for external access.
  - Cloud: Heroku with Redis for 200+ students.

### Scalability Design
- Use environment variables (`.env`) for local/cloud switching (e.g., `PORT`, `REDIS_URL`).
- Stateless API endpoints for easy cloud migration.
- Redis-ready data structure for future scaling.

---

## 4. Functional Specification
### Teacher View
- **Endpoints**:
  - `GET /api/position`: Returns current FEN and voting status.
  - `POST /api/fen`: Updates FEN (teacher-only, secured with simple key).
  - `POST /api/move`: Updates position via move (e.g., "e2e4").
  - `POST /api/voting`: Toggles voting (on/off).
  - `POST /api/reset-votes`: Clears all votes.
  - `GET /api/moves`: Returns aggregated moves with nicknames.
- **WebSocket Events**:
  - `fen-update`: Broadcasts new FEN or move.
  - `voting-update`: Broadcasts voting status.
  - `moves-update`: Sends updated move list to teacher.
- **Arrow Display**:
  - Opacity = (move votes / max votes), capped at 1.0 for most popular.

### Student View
- **Endpoints**:
  - `POST /api/move`: Submits or updates a move (e.g., `{ nickname: "Alice", move: "e2e4" }`).
  - `DELETE /api/move`: Retracts a move (if voting is enabled).
- **WebSocket Events**:
  - `fen-update`: Updates board position.
  - `voting-update`: Enables/disables move submission.
- **Behavior**:
  - Voting enabled: Drag pieces, submit/retract moves.
  - Voting disabled: Board is read-only, shows "Voting closed".

### Backend Logic
- **State**:
  - `{ fen: "...", voting: true, moves: { "e2e4": ["Alice", "Bob"], "d2d4": ["Charlie"] } }`
- **Validation**:
  - Chess.js ensures legal moves and valid FENs.
  - One move per student (tracked by session ID + nickname).

---

## 5. Development Plan
### Phase 1: Setup and Static UI (1-2 weeks)
- **Tasks**:
  1. Install Node.js: `brew install node`.
  2. Create project: `npm create vite@latest` (React), `cd client`, `npm install`.
  3. Install frontend deps: `npm install chess.js chessboardjsx chessboard-arrows`.
  4. Set up backend: `mkdir server`, `cd server`, `npm init -y`, `npm install express socket.io chess.js`.
  5. Build static Teacher View: Chessboard (70%), FEN input + buttons (30%).
  6. Build static Student View: Centered chessboard, nickname input.
  7. Test locally: `npm run dev` (client), `node index.js` (server).
- **Deliverables**:
  - Basic UI for both views.
  - Local server running.

### Phase 2: Core Functionality (2-3 weeks)
- **Tasks**:
  1. Add FEN loading: Teacher inputs FEN, updates board.
  2. Add move submission: Student drags piece, sends to server.
  3. Implement API: `/api/fen`, `/api/move`, `/api/moves`.
  4. Add move list: Display votes, mouseover for nicknames.
  5. Test with 2-3 devices (teacher + students).
- **Deliverables**:
  - Working FEN loading and move submission.
  - Move list with basic aggregation.

### Phase 3: Real-Time and Voting (2-3 weeks)
- **Tasks**:
  1. Add Socket.IO: Sync FEN, moves, and voting status.
  2. Implement voting toggle: Enable/disable without reset.
  3. Add vote reset: Clear moves and re-enable voting.
  4. Add arrows: Use `chessboard-arrows` with opacity scaling.
  5. Enable move retraction: Students can change votes.
  6. Test with 10-20 simulated students (browser tabs).
- **Deliverables**:
  - Real-time syncing.
  - Voting controls and arrows.
  - Retractable student moves.

### Phase 4: Polish and Scalability (1-2 weeks)
- **Tasks**:
  1. Refine UI: Lichess-like styling (CSS).
  2. Add error handling: Invalid FENs, move conflicts.
  3. Test with `ngrok`: Share URL, simulate 50 students.
  4. Prep for Heroku: Add `.env`, test Redis locally (`brew install redis`).
  5. Deploy to Heroku: Trial run with free tier.
- **Deliverables**:
  - Polished, functional app.
  - Cloud-ready codebase.
  - Successful test with 50 students.

**Total Timeline**: 6-10 weeks (10-15 hours/week). Slower pace accommodates JS/Node.js learning curve.

---

## 6. Local Hosting Setup
- **Requirements**:
  - Apple Silicon MacBook, macOS Ventura+.
  - Node.js v18+ (`brew install node`).
  - Internet: 10 Mbps+ upload for 50 students.
- **Steps**:
  1. Run server: `cd server`, `node index.js`.
  2. Run client: `cd client`, `npm run dev`.
  3. Use `ngrok`: `brew install ngrok`, `ngrok http 3000` (public URL).
  4. Share `https://abc123.ngrok.io/student` with students.
  5. Access teacher view: `http://localhost:3000/teacher`.
- **Notes**:
  - Firewall on (System Settings > Network).
  - `ngrok` free tier sufficient for testing.

---

## 7. Cloud Migration
- **Platform**: Heroku (simple, low-cost).
- **Steps**:
  1. Push to GitHub.
  2. `heroku create chess-club`.
  3. Add Redis: `heroku addons:create heroku-redis`.
  4. Deploy: `git push heroku main`.
  5. Set env vars: `heroku config:set PORT=80`.
- **Cost**: Free tier for testing, ~$7/month (Hobby) for 50 students, ~$25/month (Standard) for 200+.
- **Scaling**: Upgrade dynos/redis as needed.

---

## 8. Sample Code Structure
chess-club/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chessboard.jsx      # Board with arrows
│   │   │   ├── MoveList.jsx        # Votes with mouseover
│   │   ├── pages/
│   │   │   ├── Teacher.jsx         # 70/30 layout
│   │   │   ├── Student.jsx         # Centered board
│   │   ├── App.jsx                 # Routes
│   │   ├── socket.js               # Socket.IO client
├── server/
│   ├── routes/api.js               # API endpoints
│   ├── sockets/index.js            # WebSocket logic
│   ├── lib/store.js                # In-memory/Redis
│   ├── index.js                    # Express server
├── .env                            # PORT=3000, REDIS_URL
├── README.md                       # Instructions

---

## 9. Learning Resources
Since you're new to JS/Node.js:
- **HTML/CSS**: Use your skills for layout (flexbox for 70/30 split).
- **JavaScript**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Basics.
- **React**: [React Tutorial](https://react.dev/learn) - Quick start.
- **Node.js**: [Node.js Guides](https://nodejs.org/en/docs/guides) - Simple server setup.
- **Socket.IO**: [Socket.IO Docs](https://socket.io/docs/v4) - Real-time basics.

---

## 10. Next Steps
1. **Setup**: Install Node.js (`brew install node`), create project.
2. **Learn**: Skim React/Node.js tutorials (1-2 hours).
3. **Build**: Start with static UI (Phase 1), ask me for code snippets if stuck.
4. **Test**: Run locally, use `ngrok` to share with a friend.
5. **Iterate**: Add features incrementally, test with more students.
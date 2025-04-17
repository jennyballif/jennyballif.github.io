# To-Do List: Building the Interactive Chess Club Livestream System

This to-do list guides you through creating a web-based chess club app with a Teacher View and Student View, hosted locally on your Apple Silicon MacBook, with scalability to Heroku. Tasks are grouped by phase, with an estimated timeline of 6-10 weeks (10-15 hours/week). Check off each task as you complete it!

---

## Phase 1: Setup and Static UI (1-2 weeks)
Goal: Set up the project and build basic static interfaces for Teacher and Student Views.

- [x] **1. Install Node.js**
  - Open Terminal on your MacBook.
  - Run: `brew install node` (installs Node.js and npm via Homebrew).
  - Verify: `node -v` and `npm -v` (should show versions, e.g., v18.x.x).

- [x] **2. Create Project Structure**
  - Create a folder: `mkdir ChessVoteApp`.
  - Navigate: `cd ChessVoteApp`.
  - Initialize backend: `mkdir server`, `cd server`, `npm init -y`.
  - Initialize frontend: `cd ..`, `npm create vite@latest client -- --template react`, `cd client`.

- [x] **3. Install Frontend Dependencies**
  - In `client/` folder: `npm install`.
  - Install chess libraries: `npm install chess.js chessboardjsx chessboard-arrows`.
  - Verify: Check `package.json` for added dependencies.

- [x] **4. Install Backend Dependencies**
  - In `server/` folder: `npm install express socket.io chess.js`.
  - Verify: Check `package.json` for added dependencies.

- [x] **5. Set Up Basic Server**
  - In `server/`, create `index.js`:
    ```javascript
    const express = require('express');
    const app = express();
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);

    app.get('/', (req, res) => res.send('Server running'));

    server.listen(3000, () => console.log('Server on http://localhost:3000'));
Test: node index.js, visit http://localhost:3000 in browser (should see "Server running").
- [x] 6. Build Static Teacher View
  - In `client/src/App.jsx`, replace content with:
    ```jsx
    import Chessboard from 'chessboardjsx';
    import './App.css';

    function App() {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '70%' }}>
            <Chessboard position="start" />
        </div>
        <div style={{ width: '30%', padding: '20px' }}>
            <input type="text" placeholder="Enter FEN" />
            <button>Load FEN</button>
            <button>Toggle Voting</button>
            <button>Reset Votes</button>
            <ul>
            <li>e4: 5 votes</li>
            <li>d4: 3 votes</li>
            </ul>
        </div>
        </div>
    );
    }

export default App; 
Run: `npm run dev`, visit http://localhost:5173 (default Vite port).
- [x] 7. Build Static Student View
  - In `client/src/`, create `Student.jsx`:
    ```jsx
    import Chessboard from 'chessboardjsx';

    function Student() {s
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
        <Chessboard position="start" />
        <input type="text" placeholder="Enter nickname" style={{ marginTop: '10px' }} />
        <p>Submit your move</p>
        </div>
    );
    }

    export default Student;

Update `App.jsx` to route:
    ```jsx


    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import Teacher from './Teacher';
    import Student from './Student';
    import './App.css';

    function App() {
    return (
        <Router>
        <Routes>
            <Route path="/teacher" element={<Teacher />} />
            <Route path="/student" element={<Student />} />
        </Routes>
        </Router>
    );
    }

    function Teacher() {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '70%' }}>
            <Chessboard position="start" />
        </div>
        <div style={{ width: '30%', padding: '20px' }}>
            <input type="text" placeholder="Enter FEN" />
            <button>Load FEN</button>
            <button>Toggle Voting</button>
            <button>Reset Votes</button>
            <ul>
            <li>e4: 5 votes</li>
            <li>d4: 3 votes</li>
            </ul>
        </div>
        </div>
    );
    }

    export default App;

Install router: `npm install react-router-dom`.
Test: Visit http://localhost:5173/teacher and /student.
- [x] 8. Style with CSS
In `client/src/App.css`:
    ```css


    body {
    font-family: Arial, sans-serif;
    margin: 0;
    background: #f0f0f0;
    }
    button {
    display: block;
    margin: 10px 0;
    padding: 5px 10px;
    }
    input {
    display: block;
    margin: 10px 0;
    padding: 5px;
    }
    ul {
    list-style: none;
    padding: 0;
    }

Verify: UI looks clean, minimal, Lichess-like.

## Phase 2: Core Functionality (2-3 weeks)
Goal: Add FEN loading, move submission, and basic move aggregation.

- [x] 9. Add FEN Loading (Teacher)
Update `Teacher.jsx`:
    ```jsx


    import { useState } from 'react';
    import Chessboard from 'chessboardjsx';
    import { Chess } from 'chess.js';

    function Teacher() {
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/5n5/4p3/4P3/5N5/PPPP1PPP/RNBQKB1R w KQkq - 1 1');

    const handleFen = (e) => {
        const chess = new Chess();
        if (chess.load(e.target.value)) setFen(e.target.value);
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '70%' }}>
            <Chessboard position={fen} />
        </div>
        <div style={{ width: '30%', padding: '20px' }}>
            <input type="text" value={fen} onChange={handleFen} />
            <button>Load FEN</button>
            <button>Toggle Voting</button>
            <button>Reset Votes</button>
            <ul>
            <li>e4: 5 votes</li>
            <li>d4: 3 votes</li>
            </ul>
        </div>
        </div>
    );
    }

    export default Teacher;

Test: Enter a valid FEN (e.g., "rnbqkbnr/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 1 2"), see board update.
- [x] 10. Add Move Submission (Student)
Update `Student.jsx`:
    ```jsx


    import { useState } from 'react';
    import Chessboard from 'chessboardjsx';

    function Student() {
    const [nickname, setNickname] = useState('');
    const [move, setMove] = useState('');

    const handleDrop = ({ sourceSquare, targetSquare }) => {
        setMove(`${sourceSquare}${targetSquare}`);
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
        <Chessboard position="start" onDrop={handleDrop} />
        <input
            type="text"
            placeholder="Enter nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
        />
        <p>{move ? `Move submitted: ${move}` : 'Submit your move'}</p>
        <button onClick={() => setMove('')}>Retract Move</button>
        </div>
    );
    }

    export default Student;

Test: Drag a piece, see move logged (e.g., "e2e4").
- [x] 11. Set Up Backend API
In server/routes/, create `api.js`:
    ```javascript


    const express = require('express');
    const router = express.Router();
    const { Chess } = require('chess.js');

    let state = { fen: 'rnbqkbnr/pppppppp/5n5/4p3/4P3/5N5/PPPP1PPP/RNBQKB1R w KQkq - 1 1', moves: {}, voting: false };

    router.get('/position', (req, res) => res.json({ fen: state.fen, voting: state.voting }));
    router.post('/fen', (req, res) => {
    const chess = new Chess();
    if (chess.load(req.body.fen)) {
        state.fen = req.body.fen;
        res.sendStatus(200);
    } else res.sendStatus(400);
    });
    router.post('/move', (req, res) => {
    if (!state.voting) return res.sendStatus(403);
    const { nickname, move } = req.body;
    state.moves[move] = state.moves[move] || [];
    state.moves[move].push(nickname || 'Anonymous');
    res.sendStatus(200);
    });
    router.get('/moves', (req, res) => res.json(state.moves));

    module.exports = router;
Update server/index.js:
    ```javascript


    const express = require('express');
    const app = express();
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    const api = require('./routes/api');

    app.use(express.json());
    app.use('/api', api);

    server.listen(3000, () => console.log('Server on http://localhost:3000'));
Test: Use Postman or curl (e.g., `curl -X POST -H "Content-Type: application/json" -d '{"fen":"..."}' http://localhost:3000/api/fen`).
- [x] 12. Fetch Moves in Teacher View
Update Teacher.jsx:
    ```jsx


    import { useState, useEffect } from 'react';
    import Chessboard from 'chessboardjsx';

    function Teacher() {
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/5n5/4p3/4P3/5N5/PPPP1PPP/RNBQKB1R w KQkq - 1 1');
    const [moves, setMoves] = useState({});

    useEffect(() => {
        fetch('http://localhost:3000/api/moves')
        .then(res => res.json())
        .then(setMoves);
    }, []);

    const handleFen = (e) => {
        const newFen = e.target.value;
        fetch('http://localhost:3000/api/fen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: newFen })
        }).then(() => setFen(newFen));
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '70%' }}>
            <Chessboard position={fen} />
        </div>
        <div style={{ width: '30%', padding: '20px' }}>
            <input type="text" value={fen} onChange={handleFen} />
            <button>Load FEN</button>
            <button>Toggle Voting</button>
            <button>Reset Votes</button>
            <ul>
            {Object.entries(moves).map(([move, voters]) => (
                <li key={move}>{move}: {voters.length} votes</li>
            ))}
            </ul>
        </div>
        </div>
    );
    }

    export default Teacher;
Test: Submit moves via Postman (curl -X POST -d '{"nickname":"Alice","move":"e2e4"}' http://localhost:3000/api/move), refresh teacher view.

## Phase 3: Real-Time and Voting (2-3 weeks)
Goal: Add real-time updates, voting controls, and arrows.

- [x] 13. Add Socket.IO
Update server/index.js:
    ```javascript


    const express = require('express');
    const app = express();
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    const api = require('./routes/api');

    app.use(express.json());
    app.use('/api', api);

    let state = { fen: 'start', moves: {}, voting: false };
    io.on('connection', (socket) => {
    socket.emit('fen-update', state.fen);
    socket.emit('voting-update', state.voting);
    socket.emit('moves-update', state.moves);
    });

    server.listen(3000, () => console.log('Server on http://localhost:3000'));
In client/src/, create socket.js:
    ```javascript


    import io from 'socket.io-client';
    const socket = io('http://localhost:3000');
    export default socket;
Install client: cd client, npm install socket.io-client.
- [x] 14. Sync FEN and Voting
Update Teacher.jsx:
    ```jsx


    import { useState, useEffect } from 'react';
    import Chessboard from 'chessboardjsx';
    import socket from './socket';

    function Teacher() {
    const [fen, setFen] = useState('start');
    const [moves, setMoves] = useState({});
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        socket.on('fen-update', setFen);
        socket.on('moves-update', setMoves);
        socket.on('voting-update', setVoting);
        return () => {
        socket.off('fen-update');
        socket.off('moves-update');
        socket.off('voting-update');
        };
    }, []);

    const handleFen = (e) => {
        const newFen = e.target.value;
        fetch('http://localhost:3000/api/fen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: newFen })
        }).then(() => socket.emit('fen-update', newFen));
    };

    const toggleVoting = () => {
        fetch('http://localhost:3000/api/voting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voting: !voting })
        }).then(() => socket.emit('voting-update', !voting));
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width: '70%' }}>
            <Chessboard position={fen} />
        </div>
        <div style={{ width: '30%', padding: '20px' }}>
            <input type="text" value={fen} onChange={handleFen} />
            <button onClick={handleFen}>Load FEN</button>
            <button onClick={toggleVoting}>{voting ? 'Disable Voting' : 'Enable Voting'}</button>
            <button>Reset Votes</button>
            <ul>
            {Object.entries(moves).map(([move, voters]) => (
                <li key={move}>{move}: {voters.length} votes</li>
            ))}
            </ul>
        </div>
        </div>
    );
    }

    export default Teacher;
Update `Student.jsx`:
    ```jsx


    import { useState, useEffect } from 'react';
    import Chessboard from 'chessboardjsx';
    import socket from './socket';

    function Student() {
    const [fen, setFen] = useState('start');
    const [nickname, setNickname] = useState('');
    const [move, setMove] = useState('');
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        socket.on('fen-update', setFen);
        socket.on('voting-update', setVoting);
        return () => {
        socket.off('fen-update');
        socket.off('voting-update');
        };
    }, []);

    const handleDrop = ({ sourceSquare, targetSquare }) => {
        if (!voting) return;
        const newMove = `${sourceSquare}${targetSquare}`;
        setMove(newMove);
        fetch('http://localhost:3000/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, move: newMove })
        }).then(() => socket.emit('moves-update', { [newMove]: [nickname] }));
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
        <Chessboard position={fen} onDrop={handleDrop} />
        <input
            type="text"
            placeholder="Enter nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
        />
        <p>{move ? `Move submitted: ${move}` : voting ? 'Submit your move' : 'Voting closed'}</p>
        <button onClick={() => setMove('')}>Retract Move</button>
        </div>
    );
    }

    export default Student;
Update `server/routes/api.js`:
    ```javascript


    const express = require('express');
    const router = express.Router();
    const io = require('socket.io')(require('http').createServer(express()));

    let state = { fen: 'start', moves: {}, voting: false };

    router.get('/position', (req, res) => res.json({ fen: state.fen, voting: state.voting }));
    router.post('/fen', (req, res) => {
    state.fen = req.body.fen;
    io.emit('fen-update', state.fen);
    res.sendStatus(200);
    });
    router.post('/move', (req, res) => {
    if (!state.voting) return res.sendStatus(403);
    const { nickname, move } = req.body;
    state.moves[move] = state.moves[move] || [];
    state.moves[move].push(nickname || 'Anonymous');
    io.emit('moves-update', state.moves);
    res.sendStatus(200);
    });
    router.get('/moves', (req, res) => res.json(state.moves));
    router.post('/voting', (req, res) => {
    state.voting = req.body.voting;
    io.emit('voting-update', state.voting);
    res.sendStatus(200);
    });

    module.exports = router;
- [x] 15. Add Vote Reset
Update `Teacher.jsx`:
    ```jsx


    const resetVotes = () => {
    fetch('http://localhost:3000/api/reset-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }).then(() => socket.emit('moves-update', {}));
    };

    // Add to return:
    <button onClick={resetVotes}>Reset Votes</button>
    Update server/routes/api.js:
    javascript


    router.post('/reset-votes', (req, res) => {
    state.moves = {};
    io.emit('moves-update', state.moves);
    res.sendStatus(200);
    });
Test: Reset clears move list.
- [x] 16. Add Arrows
Update `Teacher.jsx`:
    ```jsx


    import Chessboard from 'chessboardjsx';
    import Arrows from 'chessboard-arrows';

    // Inside Teacher:
    const maxVotes = Math.max(...Object.values(moves).map(v => v.length), 1);
    const arrowData = Object.entries(moves).map(([move, voters]) => ({
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    opacity: voters.length / maxVotes
    }));

    // In return:
    <Chessboard position={fen}>
    <Arrows arrows={arrowData} />
    </Chessboard>
Test: Submit moves, see arrows with scaled opacity.
Phase 4: Polish and Scalability (1-2 weeks)
Goal: Refine UI, test with students, and prep for cloud.

- [x] 17. Add Mouseover Tooltips
Update Teacher.jsx:
    ```jsx


    <ul>
    {Object.entries(moves).map(([move, voters]) => (
        <li key={move} title={voters.join(', ')}>
        {move}: {voters.length} votes
        </li>
    ))}
    </ul>
Test: Hover over move, see nicknames.
- [x] 18. Polish UI
Update `App.css`:
    ```css


    .teacher-controls {
    background: #fff;
    border-left: 1px solid #ccc;
    }
    .student-container {
    max-width: 600px;
    margin: 0 auto;
    }
Apply classes in JSX.
- [x] 19. Test with ngrok
Install: `brew install ngrok`.
Run: `ngrok http 3000`.
Share student URL (e.g., https://abc123.ngrok.io/student) with a friend.
Test: Load FEN, toggle voting, submit moves.
- [x] 20. Prep for Heroku
Install Redis: `brew install redis`, `redis-server` (local test).
Update server/index.js for Redis (optional now, required for cloud).
Deploy: `heroku create ChessVoteApp`, `git push heroku main`.
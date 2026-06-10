const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
let state = { players: [], bets: [] };
app.use(express.static(path.join(__dirname, "public")));
io.on("connection", (s) => {
  s.emit("state", state);
  s.on("addPlayer", (p) => { p.id = Date.now(); p.words = p.words.map(w => ({ ...w, said: false })); state.players.push(p); io.emit("state", state); });
  s.on("removePlayer", (id) => { state.players = state.players.filter(p => p.id !== id); state.bets = state.bets.filter(b => b.targetId !== id); io.emit("state", state); });
  s.on("placeBet", (b) => { b.id = Date.now(); b.settled = false; b.won = false; state.bets.push(b); io.emit("state", state); });
  s.on("toggleWord", (d) => { const p = state.players.find(x => x.id === d.playerId); if (p) { const w = p.words[d.wordIndex]; w.said = !w.said; state.bets.forEach(b => { if (b.targetId === d.playerId && b.word === w.word) { b.settled = true; b.won = w.said; } }); io.emit("state", state); } });
  s.on("resetGame", () => { state = { players: [], bets: [] }; io.emit("state", state); });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Running on " + PORT));

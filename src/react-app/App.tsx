import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GameSetup } from "./components/GameSetup";
import { GameLoader } from "./components/GameLoader";
import { ScoreTracker } from "./components/ScoreTracker";
import type { Game, GameSettings, Player } from "./types/game";

function App() {
	const [currentGame, setCurrentGame] = useState<Game | null>(null);
	const [showGameLoader, setShowGameLoader] = useState(false);

	const handleStartGame = async (settings: GameSettings) => {
		const players: Player[] = settings.playerNames.map((name, index) => ({
			id: `player-${index + 1}`,
			name,
			score: 0,
		}));

		const game: Game = {
			id: `game-${Date.now()}`,
			name:
				settings.gameName || `UNO Game - ${new Date().toLocaleDateString()}`,
			players,
			winThreshold: settings.winThreshold,
			winner: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		setCurrentGame(game);

		// Save to KV store (will implement later)
		try {
			await fetch("/api/games", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(game),
			});
		} catch (error) {
			console.error("Failed to save game:", error);
		}
	};

	const handleUpdateGame = async (updatedGame: Game) => {
		setCurrentGame(updatedGame);

		// Update in KV store (will implement later)
		try {
			await fetch(`/api/games/${updatedGame.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updatedGame),
			});
		} catch (error) {
			console.error("Failed to update game:", error);
		}
	};

	const handleBackToSetup = () => {
		setCurrentGame(null);
		setShowGameLoader(false);
	};

	const handleLoadGame = () => {
		setShowGameLoader(true);
	};

	const handleGameLoaded = (game: Game) => {
		setCurrentGame(game);
		setShowGameLoader(false);
	};

	return (
		<Router>
			<div className="min-h-screen bg-background">
				<Routes>
					<Route
						path="/"
						element={
							currentGame ? (
								<ScoreTracker
									game={currentGame}
									onUpdateGame={handleUpdateGame}
									onBackToSetup={handleBackToSetup}
								/>
							) : showGameLoader ? (
								<GameLoader
									onLoadGame={handleGameLoaded}
									onBackToSetup={handleBackToSetup}
								/>
							) : (
								<GameSetup
									onStartGame={handleStartGame}
									onLoadGame={handleLoadGame}
								/>
							)
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;

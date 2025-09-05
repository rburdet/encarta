import { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useNavigate,
	useParams,
} from "react-router-dom";
import { faker } from "@faker-js/faker";
import { GameSetup } from "./components/GameSetup";
import { GameLoader } from "./components/GameLoader";
import { ScoreTracker } from "./components/ScoreTracker";
import type { Game, GameSettings, Player } from "./types/game";

// Generate a human-readable game ID using Spanish words
const generateGameId = (): string => {
	// Spanish words that are typically around 5 characters
	const spanishWords = [
		"fuego",
		"agua",
		"casa",
		"gato",
		"perro",
		"libro",
		"mesa",
		"silla",
		"luna",
		"sol",
		"mar",
		"rio",
		"flor",
		"arbol",
		"cielo",
		"tierra",
		"amor",
		"paz",
		"vida",
		"luz",
		"musica",
		"baile",
		"juego",
		"fiesta",
		"playa",
		"monte",
		"valle",
		"campo",
		"ciudad",
		"puente",
		"camino",
		"tiempo",
		"viento",
		"nieve",
		"lluvia",
		"nube",
		"estrella",
		"cometa",
		"planeta",
		"cosmos",
	];

	// Pick a random Spanish word
	const randomWord = faker.helpers.arrayElement(spanishWords);

	return randomWord;
};

// Component for the home page (Game Setup)
function HomePage() {
	const navigate = useNavigate();

	const handleStartGame = async (settings: GameSettings) => {
		const players: Player[] = settings.playerNames.map((name, index) => ({
			id: `player-${index + 1}`,
			name,
			score: 0,
		}));

		const game: Game = {
			id: generateGameId(),
			name:
				settings.gameName ||
				`Encarta Game - ${new Date().toLocaleDateString()}`,
			players,
			winThreshold: settings.winThreshold,
			winner: null,
			rounds: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		// Save to KV store and navigate on success
		try {
			const response = await fetch("/api/games", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(game),
			});

			if (response.ok) {
				// Navigate to the game page only if save was successful
				navigate(`/games/${game.id}`);
			} else {
				console.error("Failed to save game: Server error");
				// For now, still navigate even if save fails (offline mode)
				navigate(`/games/${game.id}`);
			}
		} catch (error) {
			console.error("Failed to save game:", error);
			// For now, still navigate even if save fails (offline mode)
			navigate(`/games/${game.id}`);
		}
	};

	const handleLoadGame = () => {
		navigate("/games");
	};

	return (
		<GameSetup onStartGame={handleStartGame} onLoadGame={handleLoadGame} />
	);
}

// Component for the games list page
function GamesPage() {
	const navigate = useNavigate();

	const handleGameLoaded = (game: Game) => {
		navigate(`/games/${game.id}`);
	};

	const handleBackToSetup = () => {
		navigate("/");
	};

	return (
		<GameLoader
			onLoadGame={handleGameLoaded}
			onBackToSetup={handleBackToSetup}
		/>
	);
}

// Component for individual game page
function GamePage() {
	const { gameId } = useParams<{ gameId: string }>();
	const navigate = useNavigate();
	const [game, setGame] = useState<Game | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadGame = async () => {
			if (!gameId) return;

			try {
				const response = await fetch(`/api/games/${gameId}`);
				if (response.ok) {
					const gameData = await response.json();
					setGame(gameData);
				} else {
					console.error("Game not found");
					navigate("/");
				}
			} catch (error) {
				console.error("Failed to load game:", error);
				navigate("/");
			} finally {
				setLoading(false);
			}
		};

		loadGame();
	}, [gameId, navigate]);

	const handleUpdateGame = async (updatedGame: Game) => {
		setGame(updatedGame);

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
		navigate("/");
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
					<p>Loading game...</p>
				</div>
			</div>
		);
	}

	if (!game) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<p>Game not found</p>
					<button
						type="button"
						onClick={handleBackToSetup}
						className="mt-4 underline"
					>
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	return (
		<ScoreTracker
			game={game}
			onUpdateGame={handleUpdateGame}
			onBackToSetup={handleBackToSetup}
		/>
	);
}

// Component for game history page
function GameHistoryPage() {
	const { gameId } = useParams<{ gameId: string }>();
	const navigate = useNavigate();

	// Placeholder for now - will implement game history later
	return (
		<div className="min-h-screen bg-background p-4">
			<div className="max-w-2xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold">Game History</h1>
					<button
						type="button"
						onClick={() => navigate(`/games/${gameId}`)}
						className="underline"
					>
						Back to Game
					</button>
				</div>
				<p>Game history for game {gameId} will be displayed here.</p>
			</div>
		</div>
	);
}

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-background">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/games" element={<GamesPage />} />
					<Route path="/games/:gameId" element={<GamePage />} />
					<Route path="/games/:gameId/history" element={<GameHistoryPage />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;

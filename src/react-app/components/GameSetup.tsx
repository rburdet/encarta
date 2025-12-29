import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import type { GameSettings, ScoringSystem } from "../types/game";

interface PlayerInput {
	id: string;
	name: string;
}

interface GameSetupProps {
	onStartGame: (settings: GameSettings) => void;
	onLoadGame: () => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const DEFAULT_WIN_THRESHOLD = 2000;

export function GameSetup({ onStartGame, onLoadGame }: GameSetupProps) {
	const idCounter = useRef(2);
	const [players, setPlayers] = useState<PlayerInput[]>([
		{ id: "player-0", name: "" },
		{ id: "player-1", name: "" },
	]);
	const [winThreshold, setWinThreshold] = useState(DEFAULT_WIN_THRESHOLD);
	const [gameName, setGameName] = useState("");
	const [scoringSystem, setScoringSystem] =
		useState<ScoringSystem>("win-on-threshold");

	const addPlayer = () => {
		if (players.length < MAX_PLAYERS) {
			const newId = `player-${idCounter.current++}`;
			setPlayers([...players, { id: newId, name: "" }]);
		}
	};

	const removePlayer = (id: string) => {
		if (players.length > MIN_PLAYERS) {
			setPlayers(players.filter((p) => p.id !== id));
		}
	};

	const updatePlayerName = (id: string, name: string) => {
		setPlayers(players.map((p) => (p.id === id ? { ...p, name } : p)));
	};

	const canStartGame = () => {
		const validNames = players.filter((p) => p.name.trim().length > 0);
		return (
			validNames.length >= MIN_PLAYERS &&
			validNames.length === players.length &&
			winThreshold > 0
		);
	};

	const handleStartGame = () => {
		if (canStartGame()) {
			onStartGame({
				playerNames: players.map((p) => p.name.trim()),
				winThreshold,
				scoringSystem,
				gameName: gameName.trim() || undefined,
			});
		}
	};

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl text-center">Encarta :D</CardTitle>
					<CardDescription className="text-center">
						Nombre de jugadores y puntos necesarios para ganar
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<label htmlFor="gameName" className="text-sm font-medium">
							Nombre del juego (Opcional)
						</label>
						<Input
							id="gameName"
							placeholder="e.g., Burakito con los pibardos"
							value={gameName}
							onChange={(e) => setGameName(e.target.value)}
						/>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<label htmlFor="players" className="text-sm font-medium">
								Jugadores
							</label>
							<Button
								variant="outline"
								size="sm"
								onClick={addPlayer}
								disabled={players.length >= MAX_PLAYERS}
							>
								<Plus className="h-4 w-4 mr-1" />
								Add
							</Button>
						</div>

						<div className="space-y-2">
							{players.map((player, index) => (
								<div key={player.id} className="flex gap-2">
									<Input
										placeholder={`Nombre del jugador ${index + 1}`}
										value={player.name}
										onChange={(e) =>
											updatePlayerName(player.id, e.target.value)
										}
									/>
									{players.length > MIN_PLAYERS && (
										<Button
											variant="outline"
											size="icon"
											onClick={() => removePlayer(player.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="winThreshold" className="text-sm font-medium">
								Puntos límite
							</label>
							<Input
								id="winThreshold"
								type="number"
								placeholder="Puntos límite"
								value={winThreshold}
								onChange={(e) => setWinThreshold(Number(e.target.value))}
								min="1"
							/>
						</div>

						<div className="space-y-3">
							<span className="text-sm font-medium">Sistema de puntuación</span>
							<div className="space-y-2">
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="win-on-threshold"
										name="scoringSystem"
										value="win-on-threshold"
										checked={scoringSystem === "win-on-threshold"}
										onChange={(e) =>
											setScoringSystem(e.target.value as ScoringSystem)
										}
										className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
									/>
									<label htmlFor="win-on-threshold" className="text-sm">
										<span className="font-medium">
											Ganar al alcanzar puntos
										</span>
										<p className="text-xs text-muted-foreground">
											El primer jugador que llegue a {winThreshold} puntos gana
										</p>
									</label>
								</div>
								<div className="flex items-center space-x-2">
									<input
										type="radio"
										id="lose-on-threshold"
										name="scoringSystem"
										value="lose-on-threshold"
										checked={scoringSystem === "lose-on-threshold"}
										onChange={(e) =>
											setScoringSystem(e.target.value as ScoringSystem)
										}
										className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
									/>
									<label htmlFor="lose-on-threshold" className="text-sm">
										<span className="font-medium">
											Perder al alcanzar puntos
										</span>
										<p className="text-xs text-muted-foreground">
											El jugador que llegue a {winThreshold} puntos pierde (ej:
											UNO)
										</p>
									</label>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-3">
						<Button
							onClick={handleStartGame}
							disabled={!canStartGame()}
							className="w-full"
						>
							Start Game
						</Button>

						<Button variant="outline" onClick={onLoadGame} className="w-full">
							<FolderOpen className="h-4 w-4 mr-2" />
							Cargar Juego Anterior
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

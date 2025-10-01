import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ArrowLeft,
	Calendar,
	Trophy,
	Search,
	Crown,
	Users,
} from "lucide-react";
import type { Game } from "../types/game";

interface GameLoaderProps {
	onLoadGame: (game: Game) => void;
	onBackToSetup: () => void;
}

interface GameSummary {
	id: string;
	name: string;
	createdAt: string;
	winner?: string | null;
	playerCount?: number;
}

export function GameLoader({ onLoadGame, onBackToSetup }: GameLoaderProps) {
	const [games, setGames] = useState<GameSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [gameWord, setGameWord] = useState("");
	const [searchLoading, setSearchLoading] = useState(false);

	useEffect(() => {
		fetchGames();
	}, []);

	const fetchGames = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/games");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch games");
			}

			setGames(data.games || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load games");
		} finally {
			setLoading(false);
		}
	};

	const handleLoadGame = async (gameId: string) => {
		try {
			const response = await fetch(`/api/games/${gameId}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to load game");
			}

			onLoadGame(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load game");
		}
	};

	const handleLoadByWord = async () => {
		if (!gameWord.trim()) return;

		try {
			setSearchLoading(true);
			setError(null);
			const response = await fetch(
				`/api/games/${gameWord.trim().toLowerCase()}`,
			);

			if (!response.ok) {
				if (response.status === 404) {
					setError(`No se encontró un juego con la palabra "${gameWord}"`);
				} else {
					const data = await response.json();
					throw new Error(data.error || "Failed to load game");
				}
				return;
			}

			const data = await response.json();
			onLoadGame(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load game");
		} finally {
			setSearchLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleLoadByWord();
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardContent className="p-6">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
							<p>Cargando juegos...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-4xl">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={onBackToSetup}
							className="h-8 w-8"
						>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<CardTitle className="text-xl">Cargar Juego</CardTitle>
							<CardDescription>
								Selecciona un juego anterior para continuar
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Quick load by Spanish word */}
					<div className="space-y-3">
						<div>
							<h3 className="font-medium text-sm mb-2">Cargar por palabra</h3>
							<div className="flex gap-2">
								<Input
									type="text"
									placeholder="Escribe la palabra del juego (ej: fuego, luna)"
									value={gameWord}
									onChange={(e) => setGameWord(e.target.value)}
									onKeyPress={handleKeyPress}
									className="flex-1"
								/>
								<Button
									onClick={handleLoadByWord}
									disabled={!gameWord.trim() || searchLoading}
									size="icon"
								>
									{searchLoading ? (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background" />
									) : (
										<Search className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<div className="relative">
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-background px-2 py-2 text-muted-foreground">
									o selecciona de la lista
								</span>
							</div>
						</div>
					</div>

					{error && (
						<div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
							<p className="text-sm text-destructive">{error}</p>
						</div>
					)}

					{games.length === 0 ? (
						<div className="text-center py-8">
							<Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">
								No hay juegos guardados aún
							</p>
							<Button
								variant="outline"
								onClick={onBackToSetup}
								className="mt-4"
							>
								Crear nuevo juego
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{games.map((game) => {
								const isFinished =
									game.winner !== null && game.winner !== undefined;
								return (
									<Card
										key={game.id}
										className={`cursor-pointer transition-all duration-200 ${
											isFinished
												? "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900"
												: "hover:bg-accent"
										}`}
										onClick={() => handleLoadGame(game.id)}
									>
										<CardContent className="p-4">
											<div className="space-y-3">
												<div className="flex items-start justify-between">
													<h3 className="font-medium text-sm leading-tight flex-1 pr-2">
														{game.name}
													</h3>
													{isFinished && (
														<Crown className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
													)}
												</div>

												<div className="space-y-2">
													<div className="flex items-center gap-1 text-xs text-muted-foreground">
														<Calendar className="h-3 w-3" />
														{formatDate(game.createdAt)}
													</div>

													{game.playerCount && (
														<div className="flex items-center gap-1 text-xs text-muted-foreground">
															<Users className="h-3 w-3" />
															{game.playerCount} jugador
															{game.playerCount !== 1 ? "es" : ""}
														</div>
													)}

													{isFinished && game.winner && (
														<div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
															<Trophy className="h-3 w-3" />
															Ganador: {game.winner}
														</div>
													)}
												</div>

												<div className="pt-1">
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
															isFinished
																? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
																: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
														}`}
													>
														{isFinished ? "Terminado" : "En progreso"}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

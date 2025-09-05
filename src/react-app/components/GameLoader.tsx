import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Calendar, Trophy } from "lucide-react";
import type { Game } from "../types/game";

interface GameLoaderProps {
	onLoadGame: (game: Game) => void;
	onBackToSetup: () => void;
}

interface GameSummary {
	id: string;
	name: string;
	createdAt: string;
}

export function GameLoader({ onLoadGame, onBackToSetup }: GameLoaderProps) {
	const [games, setGames] = useState<GameSummary[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

			onLoadGame(data.game);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load game");
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
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p>Cargando juegos...</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
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
						<div className="space-y-3">
							{games.map((game) => (
								<Card
									key={game.id}
									className="cursor-pointer hover:bg-accent transition-colors"
									onClick={() => handleLoadGame(game.id)}
								>
									<CardContent className="p-4">
										<div className="flex items-center justify-between">
											<div className="flex-1">
												<h3 className="font-medium text-sm mb-1">
													{game.name}
												</h3>
												<div className="flex items-center gap-4 text-xs text-muted-foreground">
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{formatDate(game.createdAt)}
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

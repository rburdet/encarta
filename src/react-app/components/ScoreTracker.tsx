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
import { ArrowLeft, Plus, Trophy, RotateCcw, History } from "lucide-react";
import type { Game, Player, GameRound } from "../types/game";

interface ScoreTrackerProps {
	game: Game;
	onUpdateGame: (game: Game) => void;
	onBackToSetup: () => void;
}

export function ScoreTracker({
	game,
	onUpdateGame,
	onBackToSetup,
}: ScoreTrackerProps) {
	const [roundScores, setRoundScores] = useState<Record<string, string>>({});
	const [winner, setWinner] = useState<Player | null>(null);
	const [showHistory, setShowHistory] = useState(false);

	useEffect(() => {
		// Initialize round scores
		const initialScores: Record<string, string> = {};
		for (const player of game.players) {
			initialScores[player.id] = "";
		}
		setRoundScores(initialScores);
	}, [game.players]);

	useEffect(() => {
		// Check for winner
		const winningPlayer = game.players.find(
			(player) => player.score >= game.winThreshold,
		);
		if (winningPlayer && !winner) {
			setWinner(winningPlayer);
		}
	}, [game.players, game.winThreshold, winner]);

	const updateRoundScore = (playerId: string, score: string) => {
		setRoundScores((prev) => ({
			...prev,
			[playerId]: score,
		}));
	};

	const addRound = () => {
		// Create the round record
		const roundScoresRecord: Record<string, number> = {};
		const updatedPlayers = game.players.map((player) => {
			const roundScore = Number(roundScores[player.id]) || 0;
			roundScoresRecord[player.id] = roundScore;
			return {
				...player,
				score: player.score + roundScore,
			};
		});

		// Create new round entry
		const newRound: GameRound = {
			roundNumber: (game.rounds?.length || 0) + 1,
			scores: roundScoresRecord,
		};

		const updatedGame: Game = {
			...game,
			players: updatedPlayers,
			rounds: [...(game.rounds || []), newRound],
			updatedAt: new Date().toISOString(),
		};

		onUpdateGame(updatedGame);

		// Reset round scores
		const resetScores: Record<string, string> = {};
		for (const player of game.players) {
			resetScores[player.id] = "";
		}
		setRoundScores(resetScores);
	};

	const resetGame = () => {
		const resetPlayers = game.players.map((player) => ({
			...player,
			score: 0,
		}));

		const resetGame: Game = {
			...game,
			players: resetPlayers,
			winner: null,
			rounds: [],
			updatedAt: new Date().toISOString(),
		};

		onUpdateGame(resetGame);
		setWinner(null);
	};

	const canAddRound = () => {
		return Object.values(roundScores).some((score) => {
			const numScore = Number(score);
			return !Number.isNaN(numScore) && numScore > 0;
		});
	};

	const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

	return (
		<div className="min-h-screen bg-background p-4">
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="outline" onClick={onBackToSetup}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Setup
					</Button>
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => setShowHistory(!showHistory)}
						>
							<History className="h-4 w-4 mr-2" />
							{showHistory ? "Hide History" : "Show History"}
						</Button>
						<Button variant="outline" onClick={resetGame}>
							<RotateCcw className="h-4 w-4 mr-2" />
							Reset Game
						</Button>
					</div>
				</div>

				{winner && (
					<Card className="border-yellow-200 bg-yellow-50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-2">
								<Trophy className="h-8 w-8 text-yellow-600" />
							</div>
							<CardTitle className="text-yellow-800">
								🎉 Game Over! 🎉
							</CardTitle>
							<CardDescription className="text-yellow-700">
								{winner.name} wins with {winner.score} points!
							</CardDescription>
						</CardHeader>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							{game.name || "Encarta Game"}
							<span className="text-sm font-normal text-muted-foreground">
								Win at {game.winThreshold} points
							</span>
						</CardTitle>
					</CardHeader>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Current Scores</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{sortedPlayers.map((player, index) => (
								<div
									key={player.id}
									className={`flex items-center justify-between p-3 rounded-lg border ${
										index === 0
											? "border-yellow-200 bg-yellow-50"
											: "border-gray-200"
									}`}
								>
									<div className="flex items-center gap-3">
										<span className="text-lg font-semibold">#{index + 1}</span>
										<span className="font-medium">{player.name}</span>
									</div>
									<span className="text-xl font-bold">{player.score}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{showHistory && game.rounds && game.rounds.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Round History</CardTitle>
							<CardDescription>Score progression by round</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{/* Header row */}
								<div className="flex items-center gap-3 pb-2 border-b font-medium text-sm">
									<span className="w-16">Round</span>
									{game.players.map((player) => (
										<span key={player.id} className="flex-1 text-center">
											{player.name}
										</span>
									))}
								</div>

								{/* Round rows */}
								{game.rounds.map((round) => (
									<div
										key={round.roundNumber}
										className="flex items-center gap-3 text-sm"
									>
										<span className="w-16 font-medium text-center">
											#{round.roundNumber}
										</span>
										{game.players.map((player) => (
											<span key={player.id} className="flex-1 text-center">
												{round.scores[player.id] || 0}
											</span>
										))}
									</div>
								))}

								{/* Total row */}
								<div className="flex items-center gap-3 pt-2 border-t font-bold text-sm">
									<span className="w-16 text-center">Total</span>
									{game.players.map((player) => (
										<span key={player.id} className="flex-1 text-center">
											{player.score}
										</span>
									))}
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{!winner && (
					<Card>
						<CardHeader>
							<CardTitle>Add Round Scores</CardTitle>
							<CardDescription>
								Enter the points each player scored this round
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{game.players.map((player) => (
								<div key={player.id} className="flex items-center gap-3">
									<span className="w-24 font-medium">{player.name}:</span>
									<Input
										type="number"
										value={roundScores[player.id] || ""}
										onChange={(e) =>
											updateRoundScore(player.id, e.target.value)
										}
										className="w-24"
									/>
									<span className="text-sm text-muted-foreground">points</span>
								</div>
							))}

							<Button
								onClick={addRound}
								disabled={!canAddRound()}
								className="w-full"
							>
								<Plus className="h-4 w-4 mr-2" />
								Add Round
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

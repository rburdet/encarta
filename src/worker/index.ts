import { Hono } from "hono";

interface GameSummary {
  id: string;
  name: string;
  createdAt: string;
}

interface EnrichedGameSummary extends GameSummary {
  winner?: string | null;
  playerCount?: number;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "UNO Score Tracker" }));

// Game management endpoints
app.post("/api/games", async (c) => {
  try {
    const game = await c.req.json();
    
    // Store game in KV
    await c.env.CARD_GAMES.put(`game:${game.id}`, JSON.stringify(game));
    
    // Also store in a list for potential future listing
    const gamesList = await c.env.CARD_GAMES.get("games:list");
    const games = gamesList ? JSON.parse(gamesList) : [];
    games.push({ id: game.id, name: game.name, createdAt: game.createdAt });
    await c.env.CARD_GAMES.put("games:list", JSON.stringify(games));
    
    return c.json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    return c.json({ error: "Failed to create game" }, 500);
  }
});

app.get("/api/games/:id", async (c) => {
  try {
    const gameId = c.req.param("id");
    const gameData = await c.env.CARD_GAMES.get(`game:${gameId}`);
    
    if (!gameData) {
      return c.json({ error: "Game not found" }, 404);
    }
    
    const game = JSON.parse(gameData);
    return c.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    return c.json({ error: "Failed to fetch game" }, 500);
  }
});

app.put("/api/games/:id", async (c) => {
  try {
    const gameId = c.req.param("id");
    const updatedGame = await c.req.json();
    
    // Verify game exists
    const existingGame = await c.env.CARD_GAMES.get(`game:${gameId}`);
    if (!existingGame) {
      return c.json({ error: "Game not found" }, 404);
    }
    
    // Update game in KV
    await c.env.CARD_GAMES.put(`game:${gameId}`, JSON.stringify(updatedGame));
    
    return c.json(updatedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return c.json({ error: "Failed to update game" }, 500);
  }
});

app.get("/api/games", async (c) => {
  try {
    const gamesList = await c.env.CARD_GAMES.get("games:list");
    const games = gamesList ? JSON.parse(gamesList) : [];
    
    // Enrich games with winner status
    const enrichedGames = await Promise.all(
      games.map(async (gameSummary: GameSummary): Promise<EnrichedGameSummary> => {
        try {
          const gameData = await c.env.CARD_GAMES.get(`game:${gameSummary.id}`);
          if (gameData) {
            const fullGame = JSON.parse(gameData);
            return {
              ...gameSummary,
              winner: fullGame.winner,
              playerCount: fullGame.players?.length || 0
            };
          }
          return gameSummary;
        } catch (error) {
          console.error(`Error enriching game ${gameSummary.id}:`, error);
          return gameSummary;
        }
      })
    );
    
    const sortedGames = enrichedGames.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return c.json({ games: sortedGames });
  } catch (error) {
    console.error("Error fetching games list:", error);
    return c.json({ error: "Failed to fetch games" }, 500);
  }
});

export default app;

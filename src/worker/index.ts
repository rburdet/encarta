import { Hono } from "hono";

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
    return c.json({ games });
  } catch (error) {
    console.error("Error fetching games list:", error);
    return c.json({ error: "Failed to fetch games" }, 500);
  }
});

export default app;

import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;
let dbInitialized: Promise<void> | null = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
    } catch (err) {
      console.warn("Failed to initialize Neon pool:", err);
    }
  }
  return pool;
}

async function initDB() {
  const p = getPool();
  if (!p) {
    return;
  }
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id TEXT PRIMARY KEY,
        data JSONB
      )
    `);
  } catch (err) {
    console.warn("Database initialization failed:", err);
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (!dbInitialized) {
      dbInitialized = initDB();
    }
    await dbInitialized;
  } catch (err: any) {
    console.warn("DB Initialization error:", err);
  }

  const p = getPool();
  const method = req.method;

  if (method === "GET") {
    if (!p) {
      return res.status(200).json([]);
    }
    try {
      const { rows } = await p.query("SELECT data FROM cars");
      const cars = rows.map((r: any) => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
      return res.status(200).json(cars);
    } catch (err: any) {
      console.error("Neon GET error:", err);
      return res.status(200).json([]); // Fallback on error
    }
  }

  if (method === "POST") {
    let car = req.body;
    if (typeof car === "string") {
      try {
        car = JSON.parse(car);
      } catch (e) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }
    if (!car.id) {
      car.id = `car-${Date.now()}`;
    }

    if (!p) {
      return res.status(500).json({ error: "Database not connected" });
    }

    try {
      const carDataString = JSON.stringify(car);
      await p.query(
        "INSERT INTO cars (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2",
        [car.id, carDataString]
      );
      return res.status(200).json({ success: true, id: car.id });
    } catch (err: any) {
      console.error("Neon POST error:", err);
      return res.status(500).json({ error: "Failed to save to db" });
    }
  }

  if (method === "DELETE") {
    const id = req.query?.id || req.params?.id || req.url?.split("/").pop()?.split("?")[0];
    if (!id || id === "cars") {
      return res.status(400).json({ error: "Car ID is required for deletion" });
    }

    if (!p) {
      return res.status(500).json({ error: "Database not connected" });
    }

    try {
      await p.query("DELETE FROM cars WHERE id = $1", [id]);
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error("Neon DELETE error:", err);
      return res.status(500).json({ error: "Failed to delete" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

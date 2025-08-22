const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { expressjwt } = require("express-jwt");
const { pool, initDb } = require("./db");

/* ───── Supabase client ─────────────────────────────────────────────── */
const { createClient } = require("@supabase/supabase-js");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);
const BUCKET = process.env.SUPABASE_BUCKET || "photos";
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret";

/* ─────── Cache Setup ──────────────────────────────────────────────── */
const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes
const cache = {};

const clearCache = (keyBuilder) => (req, res, next) => {
  const key = typeof keyBuilder === "function" ? keyBuilder(req) : keyBuilder;
  if (key) {
    console.log(`Cache cleared for key: ${key}`);
    delete cache[key];
  }
  next();
};

const resolveMemorial = async (req, res, next) => {
  try {
    let slug = req.hostname.split(".")[0];
    if (slug === "localhost" || slug === "127" || !slug) {
      slug = req.query.memorial || "demo";
    }
    const { rows } = await pool.query("SELECT * FROM memorials WHERE slug = $1", [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Memorial not found" });
    }
    req.memorial = rows[0];
    next();
  } catch (err) {
    console.error("Error resolving memorial:", err);
    res.status(500).json({ error: "Failed to resolve memorial" });
  }
};

/* ───────── Express setup ──────────────────────────────────────────────── */
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

/* ───── Auth Middleware ───────────────────��────────────────────────── */
const auth = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
});

const adminOnly = (req, res, next) => {
  if (req.auth.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

/* ───── Multer: keep files in memory so we can push to Supabase ───── */
const upload = multer({ storage: multer.memoryStorage() });

/* ───────────────── Auth Endpoints ─────────────────────────────────── */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Failed to log in." });
  }
});

/* ───────────────── Memorial Endpoints ───────────────────────────── */
app.get("/memorial", resolveMemorial, (req, res) => {
  res.json(req.memorial);
});

app.post("/memorials", auth, adminOnly, async (req, res) => {
  const { slug, display_name, template_id } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO memorials (slug, display_name, template_id) VALUES ($1,$2,$3) RETURNING *",
      [slug, display_name, template_id || "default"],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating memorial:", err);
    res.status(500).json({ error: "Failed to create memorial." });
  }
});

/* ───────────────── Tributes Endpoints ────────────────────────────── */
app.get("/tributes", resolveMemorial, async (req, res) => {
  const cacheKey = `tributes-${req.memorial.id}`;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION_MS) {
    console.log("Serving tributes from cache");
    return res.json(cache[cacheKey].data);
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM tributes WHERE memorial_id = $1 ORDER BY timestamp DESC",
      [req.memorial.id],
    );
    cache[cacheKey] = {
      timestamp: now,
      data: rows,
    };
    console.log("Serving tributes from DB and caching");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching tributes:", err);
    res.status(500).json({ error: "Failed to fetch tributes." });
  }
});

app.post(
  "/tributes",
  resolveMemorial,
  clearCache((req) => `tributes-${req.memorial.id}`),
  async (req, res) => {
    const { name, relationship, message, type } = req.body;
    const sanitizedMessage = DOMPurify.sanitize(message);
    const id = uuidv4();
    try {
      const { rows } = await pool.query(
        "INSERT INTO tributes (id, name, relationship, message, type, memorial_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
        [id, name, relationship, sanitizedMessage, type, req.memorial.id],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Error posting tribute:", err);
      res.status(500).json({ error: "Failed to post tribute." });
    }
  },
);

app.delete(
  "/tributes/:id",
  auth,
  adminOnly,
  resolveMemorial,
  clearCache((req) => `tributes-${req.memorial.id}`),
  async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM tributes WHERE id = $1 AND memorial_id = $2", [id, req.memorial.id]);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting tribute:", err);
      res.status(500).json({ error: "Failed to delete tribute." });
    }
  },
);

/* ───────────────── Eulogy Endpoints ──────────────────────────────── */
app.get("/eulogy", resolveMemorial, async (req, res) => {
  const cacheKey = `eulogy-${req.memorial.id}`;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION_MS) {
    console.log("Serving eulogy from cache");
    return res.json(cache[cacheKey].data);
  }
  try {
    const { rows } = await pool.query(
      "SELECT content FROM eulogy_content WHERE memorial_id = $1 LIMIT 1",
      [req.memorial.id],
    );
    const data = { content: rows.length > 0 ? rows[0].content : "" };
    cache[cacheKey] = {
      timestamp: now,
      data,
    };
    console.log("Serving eulogy from DB and caching");
    res.json(data);
  } catch (err) {
    console.error("Error fetching eulogy content:", err);
    res.status(500).json({ error: "Failed to fetch eulogy content." });
  }
});

app.put(
  "/eulogy",
  auth,
  adminOnly,
  resolveMemorial,
  clearCache((req) => `eulogy-${req.memorial.id}`),
  async (req, res) => {
    const { content } = req.body;
    try {
      await pool.query(
        "INSERT INTO eulogy_content (memorial_id, content) VALUES ($1,$2) ON CONFLICT (memorial_id) DO UPDATE SET content = EXCLUDED.content",
        [req.memorial.id, content],
      );
      res.status(200).json({ message: "Eulogy content updated successfully." });
    } catch (err) {
      console.error("Error updating eulogy content:", err);
      res.status(500).json({ error: "Failed to update eulogy content." });
    }
  },
);

/* ───────────────── Photos Endpoints ───────────────────────────────── */
app.get("/photos", resolveMemorial, async (req, res) => {
  const cacheKey = `photos-${req.memorial.id}`;
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION_MS) {
    console.log("Serving photos from cache");
    return res.json(cache[cacheKey].data);
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM photos WHERE memorial_id = $1 ORDER BY timestamp DESC",
      [req.memorial.id],
    );
    cache[cacheKey] = {
      timestamp: now,
      data: rows,
    };
    console.log("Serving photos from DB and caching");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching photos:", err);
    res.status(500).json({ error: "Failed to fetch photos." });
  }
});

app.post(
  "/photos",
  upload.array("photos"),
  resolveMemorial,
  clearCache((req) => `photos-${req.memorial.id}`),
  async (req, res) => {
    const files = Array.isArray(req.files) ? req.files : [];
    const { caption, name, email } = req.body;

    if (name && email) {
      const userData = `Name: ${name}, Email: ${email}\n`;
      fs.appendFile(path.join(__dirname, "users.txt"), userData, (err) => {
        if (err) {
          console.error("Failed to write user data to file:", err);
        }
      });
    }

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    try {
      const newPhotos = [];

      for (const file of files) {
        const id = uuidv4();
        const filename = `${id}${path.extname(file.originalname)}`;

        /* upload to Supabase Storage */
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });
        if (uploadErr) throw uploadErr;

        /* get public URL */
        const { data: pub } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(filename);

        /* save metadata in Postgres */
        const { rows } = await pool.query(
          "INSERT INTO photos (id, src, caption, name, email, memorial_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [id, pub.publicUrl, caption, name, email, req.memorial.id],
        );
        newPhotos.push(rows[0]);
      }

      res.status(201).json(newPhotos);
    } catch (err) {
      console.error("Error posting photos:", err);
      res.status(500).json({ error: "Failed to post photos." });
    }
  },
);

app.delete(
  "/photos/:id",
  auth,
  adminOnly,
  resolveMemorial,
  clearCache((req) => `photos-${req.memorial.id}`),
  async (req, res) => {
    const { id } = req.params;
    try {
      const { rows } = await pool.query(
        "SELECT src FROM photos WHERE id = $1 AND memorial_id = $2",
        [id, req.memorial.id],
      );
      if (rows.length > 0) {
        const src = rows[0].src;
        const filename = path.basename(new URL(src).pathname);
        await supabase.storage.from(BUCKET).remove([filename]);
      }

      await pool.query("DELETE FROM photos WHERE id = $1 AND memorial_id = $2", [id, req.memorial.id]);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting photo:", err);
      res.status(500).json({ error: "Failed to delete photo." });
    }
  },
);

/* ───────────────��─ Initialize DB & start server ───────────────────── */
initDb()
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)),
  )
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });

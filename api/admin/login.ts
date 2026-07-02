export default function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { username, password } = req.body || {};
    console.log("Admin Login POST received:", { username, password });

    // Normalize visually identical Cyrillic / Latin characters and trim whitespace
    const norm = (s: string) => {
      if (!s) return "";
      const map: { [key: string]: string } = {
        "\u0410": "A", "\u0412": "B", "\u0415": "E", "\u041A": "K", "\u041C": "M", "\u041D": "H", "\u041E": "O", "\u0420": "P", "\u0421": "C", "\u0422": "T", "\u0425": "X",
        "\u0430": "a", "\u0435": "e", "\u043E": "o", "\u0440": "p", "\u0441": "c", "\u0443": "y", "\u0445": "x"
      };
      return s.trim().split("").map(c => map[c] || c).join("");
    };

    const normUser = norm(username).toUpperCase();
    const normPass = norm(password);
    const normPassUpper = normPass.toUpperCase();

    if (normUser === "LA" && (normPass === "LA123" || normPassUpper === "LA123")) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: "Invalid username or password" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

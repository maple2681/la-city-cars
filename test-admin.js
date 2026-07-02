const admin = require('firebase-admin');
admin.initializeApp({ projectId: "gen-lang-client-0642064348" });
const db = admin.firestore();
// try to get cars
db.collection("cars").get().then(snap => console.log("Success:", snap.size)).catch(e => console.error("Error:", e));

import { getApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp({ projectId: "gen-lang-client-0642064348" });
const db = getFirestore("ai-studio-lacitycars-11e474df-9091-4fa4-b55b-6d1a422632f9");
db.collection("cars").get().then(snap => console.log("Success:", snap.size)).catch(e => console.error("Error:", e));

import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const camposObrigatorios = ["apiKey", "authDomain", "projectId", "appId"];
const camposAusentes = camposObrigatorios.filter((campo) => !firebaseConfig[campo]);

if (camposAusentes.length > 0) {
    throw new Error(`Configure as variáveis Firebase ausentes: ${camposAusentes.join(", ")}.`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };

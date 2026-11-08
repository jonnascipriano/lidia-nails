import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app);

export const persistirSessao = () => setPersistence(auth, browserLocalPersistence);

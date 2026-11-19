import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebaseFirestore";

const obterReferenciaPreferencia = (usuarioId) =>
    doc(db, "preferenciasUsuarios", usuarioId);

export const observarPreferenciaTema = (usuarioId, aoAtualizar, aoFalhar) =>
    onSnapshot(
        obterReferenciaPreferencia(usuarioId),
        (snapshot) => aoAtualizar(snapshot.exists() && snapshot.data().modoEscuro === true),
        aoFalhar
    );

export const salvarPreferenciaTema = (usuarioId, modoEscuro) =>
    setDoc(obterReferenciaPreferencia(usuarioId), { modoEscuro }, { merge: true });

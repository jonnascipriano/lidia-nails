import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseFirestore";

const colecaoGastos = collection(db, "gastos");

export const observarGastos = (aoAtualizar, aoFalhar) => onSnapshot(
    colecaoGastos,
    (snapshot) => {
        const gastos = snapshot.docs
            .map((documento) => ({ ...documento.data(), id: documento.id }))
            .sort((a, b) => b.data.localeCompare(a.data));
        aoAtualizar(gastos);
    },
    aoFalhar
);

export const criarGasto = (gasto) => addDoc(colecaoGastos, {
    ...gasto,
    criadoEm: serverTimestamp(),
});

export const excluirGasto = (id) => deleteDoc(doc(db, "gastos", id));

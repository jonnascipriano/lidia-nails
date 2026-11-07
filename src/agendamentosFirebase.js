import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseFirestore";

const colecaoAgendamentos = collection(db, "agendamentos");

const compararAgendamentos = (a, b) => {
    if (a.data === b.data) return a.horario.localeCompare(b.horario);
    return a.data.localeCompare(b.data);
};

const criarIdLegado = (agendamento, indice) => {
    const texto = `${JSON.stringify(agendamento)}-${indice}`;
    let hash = 2166136261;
    for (let caractere = 0; caractere < texto.length; caractere++) {
        hash ^= texto.charCodeAt(caractere);
        hash = Math.imul(hash, 16777619);
    }
    return `legado-${(hash >>> 0).toString(16)}`;
};

export const observarAgendamentos = (aoAtualizar, aoFalhar) => onSnapshot(
    colecaoAgendamentos,
    (snapshot) => {
        const agendamentos = snapshot.docs
            .map((documento) => ({ ...documento.data(), id: documento.id }))
            .sort(compararAgendamentos);
        aoAtualizar(agendamentos);
    },
    aoFalhar
);

export const criarAgendamento = (agendamento) => addDoc(colecaoAgendamentos, {
    ...agendamento,
    criadoEm: serverTimestamp(),
});

export const atualizarAgendamento = (id, alteracoes) =>
    updateDoc(doc(db, "agendamentos", id), alteracoes);

export const excluirAgendamento = (id) => deleteDoc(doc(db, "agendamentos", id));

export const migrarAgendamentosLocais = async () => {
    const chaveMigracao = "agendamentosMigradosFirebase";
    if (localStorage.getItem(chaveMigracao) === "true") return;

    const agendamentosLocais = localStorage.getItem("agendamentos");
    let listaLegada = [];
    if (agendamentosLocais) {
        listaLegada = JSON.parse(agendamentosLocais);
        if (!Array.isArray(listaLegada)) {
            throw new Error("Os agendamentos salvos neste navegador estão em um formato inválido.");
        }
    }

    const ocorrencias = new Map();
    for (let inicio = 0; inicio < listaLegada.length; inicio += 450) {
        const lote = writeBatch(db);
        listaLegada.slice(inicio, inicio + 450).forEach((agendamento) => {
            const textoAgendamento = JSON.stringify(agendamento);
            const ocorrencia = ocorrencias.get(textoAgendamento) || 0;
            ocorrencias.set(textoAgendamento, ocorrencia + 1);
            const id = criarIdLegado(agendamento, ocorrencia);
            lote.set(doc(db, "agendamentos", id), { ...agendamento, origem: agendamento.origem || "migrado" });
        });
        await lote.commit();
    }

    localStorage.setItem(chaveMigracao, "true");
    localStorage.removeItem("agendamentos");
};

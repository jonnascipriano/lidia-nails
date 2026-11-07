import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseFirestore";

const colecaoAgendamentos = collection(db, "agendamentos");
const configuracaoAgendaRef = doc(db, "configuracoes", "agenda");

const compararAgendamentos = (a, b) => {
    if (a.data === b.data) return a.horario.localeCompare(b.horario);
    return a.data.localeCompare(b.data);
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

export const observarConfiguracaoAgenda = (aoAtualizar, aoFalhar) => onSnapshot(
    configuracaoAgendaRef,
    (snapshot) => aoAtualizar(snapshot.exists() ? snapshot.data() : null),
    aoFalhar
);

export const salvarConfiguracaoAgenda = (configuracao) =>
    setDoc(configuracaoAgendaRef, configuracao);

const criarIdLegado = (texto) => {
    let hash = 2166136261;
    for (let caractere = 0; caractere < texto.length; caractere++) {
        hash ^= texto.charCodeAt(caractere);
        hash = Math.imul(hash, 16777619);
    }
    return `legado-${(hash >>> 0).toString(16)}`;
};

export const migrarDadosLocais = async () => {
    const agendamentosLocais = localStorage.getItem("agendamentos");
    let listaLegada = [];
    if (agendamentosLocais) {
        try {
            listaLegada = JSON.parse(agendamentosLocais);
        } catch {
            throw new Error("Os agendamentos salvos neste navegador estão em um formato inválido.");
        }
        if (!Array.isArray(listaLegada) || listaLegada.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
            throw new Error("Os agendamentos salvos neste navegador estão em um formato inválido.");
        }
    }

    for (let inicio = 0; inicio < listaLegada.length; inicio += 450) {
        const lote = writeBatch(db);
        listaLegada.slice(inicio, inicio + 450).forEach((agendamento, indiceLote) => {
            const textoAgendamento = JSON.stringify(agendamento);
            const id = criarIdLegado(`${textoAgendamento}-${inicio + indiceLote}`);
            lote.set(doc(db, "agendamentos", id), { ...agendamento, origem: agendamento.origem || "migrado" });
        });
        await lote.commit();
    }

    const configuracaoLocal = localStorage.getItem("configSalao");
    if (configuracaoLocal) {
        let configuracao;
        try {
            configuracao = JSON.parse(configuracaoLocal);
        } catch {
            throw new Error("As configurações salvas neste navegador estão em um formato inválido.");
        }

        if (!configuracao || typeof configuracao !== "object" || Array.isArray(configuracao)) {
            throw new Error("As configurações salvas neste navegador estão em um formato inválido.");
        }

        const configuracaoExistente = await getDoc(configuracaoAgendaRef);
        if (!configuracaoExistente.exists()) {
            await setDoc(configuracaoAgendaRef, configuracao);
        } else if (JSON.stringify(configuracaoExistente.data()) !== JSON.stringify(configuracao)) {
            const idLegado = criarIdLegado(JSON.stringify(configuracao));
            await setDoc(doc(db, "configuracoes", idLegado), configuracao);
        }
    }

    localStorage.removeItem("agendamentos");
    localStorage.removeItem("configSalao");
};

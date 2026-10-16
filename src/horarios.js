export const calcularHorarioTermino = (horarioInicio, duracao) => {
    if (typeof horarioInicio !== "string") return null;

    const [horas, minutos] = horarioInicio.split(":").map(Number);
    const duracaoMinutos = Number(duracao);
    if (![horas, minutos, duracaoMinutos].every(Number.isFinite)) return null;

    const totalMinutos = horas * 60 + minutos + duracaoMinutos;
    const horaTermino = String(Math.floor(totalMinutos / 60)).padStart(2, "0");
    const minutoTermino = String(totalMinutos % 60).padStart(2, "0");
    return `${horaTermino}:${minutoTermino}`;
};

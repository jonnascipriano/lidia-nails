export default function ResumoDashboard(){
    return(
        <section className="bg-primary min-h-screen w-full">

            {/* Titulo da página */}
            <div className="p-5">
                <h1>Dashboard</h1>
                <p className="text-tertiary tracking-wide pl-0.5">Resumo do seu negócio.</p>
            </div>

            <div className="flex flex-wrap gap-5 justify-center m-5">
                <div className="w-full">
                    {/* Resumo do dia */}
                    <div className="flex-1 p-5 rounded-2xl bg-gray-800 shadow-2xl flex flex-col gap-2">
                        <p className="text-info font-semibold">Faturamento hoje</p>
                        <h2 className="text-green-300 font-bold text-4xl">R$ 400</h2>
                        <p className="text-destaque">2 agendamentos</p>
                    </div>
                </div>


                <div className="flex gap-5 w-full justify-center">
                    {/* Resumo da Semana */}
                    <div className="bg-secondary p-5 w-full rounded-2xl shadow-2xl flex flex-col gap-2">
                        <p className="text-sm text-info">Esta Semana</p>
                        <h2 className="text-2xl font-medium">R$ 685</h2>
                        <p className="text-xs text-info">8 agendamentos</p>
                    </div>
                    {/* Resumo do mês */}
                    <div className="bg-secondary p-5 w-full rounded-2xl shadow-2xl flex flex-col gap-2">
                        <p className="text-sm text-info">Este mês</p>
                        <h2 className="text-2xl font-medium">R$ 1155</h2>
                        <p className="text-xs text-info">15 agendamentos</p>
                    </div>
                </div>
            </div>


        </section>
    )
}
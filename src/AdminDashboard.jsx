export default function AdminDashboard({onLogout}){
    return(
        <div>
            <header className="flex justify-between p-2.5">
                <h1>Painel Administrativo</h1>
                <button onClick={onLogout} className="cursor-pointer">Ver como cliente</button>
            </header>
        </div>
    )
}
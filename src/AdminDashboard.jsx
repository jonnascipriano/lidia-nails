import ButtonSwitch from "./ButtonSwitch";

export default function AdminDashboard({onLogout}){
    return(
        <div>
            <header className="flex justify-between p-2.5">
                <h1>Painel Administrativo</h1>
                <ButtonSwitch onClick={onLogout}>Ver como cliente</ButtonSwitch>
            </header>
        </div>
    )
}
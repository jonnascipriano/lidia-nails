import ButtonSwitch from "./ButtonSwitch";

export default function Header(){
    const caminho = window.location.pathname
    return(
        <header className="flex justify-between px-5 py-4 items-center bg-secondary">
            <div className="flex items-center gap-2">
                <img src="./src/assets/img/logo.jpg"/>
                <h1 className="text-[#881337] font-medium">Lídia Oliveira</h1>
            </div>
                {caminho.endsWith("/admin") && (
                    <ButtonSwitch>Ver como cliente</ButtonSwitch>
                )}
                {
                    !caminho.endsWith('/admin') && (
                        <img src="./src/assets/img/unha.png"/>
                    )
                }
        </header>
    )
}
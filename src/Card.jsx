export default function Card({children}){
    return(
        <div className="flex justify-between items-center border-2 border-transparent hover:border-destaque bg-white rounded-2xl m-5 px-5 py-2 transition-colors">
            {children}
        </div>
    )
}
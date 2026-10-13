export default function Card({children}){
    return(
        <div className="
                flex 
                justify-between 
                items-center 
                border-2 
                border-transparent 
                bg-white 
                rounded-2xl 
                m-5 
                px-5 
                py-2 
                hover:border-destaque 
                transition-all
                hover:-translate-y-2
                duration-400
                shadow-2xl">
            {children}
        </div>
    )
}
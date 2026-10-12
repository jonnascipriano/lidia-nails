export default function ButtonSwitch({ children, ...props }) {
    return (
        <button 
            {...props} 
            className="bg-button font-medium text-sm px-2 rounded-2xl cursor-pointer"
        >
            {children}
        </button>
    )
}
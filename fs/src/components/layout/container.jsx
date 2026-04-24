

const Container = ({
    children
}) => {
    return <main className="w-dvw  min-h-screen py-5 md:py-0 md:h-dvh bg-purple-200 
            flex flex-row justify-center items-center" >
        {children}
        </main>
}

export default Container;

const Footer = () => {
    return <footer className="w-dvw text-[9px] md:text-sm bg-purple-800 px-2 h-18 md:px-15 md:h-25 py-5 md:py-8
                flex flex-row flex-start justify-between text-white ">
        <div>
                <p className="text-center font-semibold" >
                    Created By    
                </p>
                 <span className="text-[8px] md:text-sm">                     
                        Bikash Khanal
                    </span>
        </div>

        <div className="flex flex-col justify-center ">
           <p>@2026 Khanal Dhuwani Sewa Sindhuli, All rights reserved.</p>
        </div>

        <div>
           <span>Connect With Me</span>
           <div>
            {/* links */}

           </div>
        </div>
            </footer>
}

export default Footer;
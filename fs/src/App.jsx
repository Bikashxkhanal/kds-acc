import Button from "./components/common/button.jsx"
import InputBox from "./components/common/InputBox.jsx";

function App() {
       //onClick demonstration
       const handleClick = () => {
              console.log("Button CLicked");
              
       }


       

 return <div className="w-[100%] min-h-screen bg-purple-300 flex flex-col items-center justify-center  ">
        <InputBox onChange={(val) => console.log(val)
        } />
        <Button  varient='danger' size='md' onClick={handleClick} />
       
       </div>
}

export default App

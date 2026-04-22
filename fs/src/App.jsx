import Button from "./components/common/button.jsx"
import InputBox from "./components/common/InputBox.jsx";
import LoginForm from "./features/auth/ui/loginform.jsx";

function App() {
       //onClick demonstration
       const handleClick = () => {
              console.log("Button CLicked");
              
       }


       

 return <div className="w-[100%] min-h-screen bg-purple-300 flex flex-col items-center justify-center  ">
        <LoginForm />
        </div>
}

export default App

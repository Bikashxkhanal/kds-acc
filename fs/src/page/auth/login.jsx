import { Header, Footer, Container} from "../../components/index";
import LoginForm from "../../features/auth/ui/loginform";

const LoginPage = () => {
           //onClick demonstration
       const handleClick = () => {
              console.log("Button CLicked");
              
       }


       

 return <div className="w-[100%] min-h-screen bg-purple-300 flex flex-col items-center justify-center  ">
       <Header />
       <Container >
              <LoginForm />
       </Container>  
       <Footer />
        </div>
}

export default LoginPage;
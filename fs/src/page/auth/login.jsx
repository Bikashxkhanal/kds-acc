import { Header, Footer } from "../../components/index";
import LoginForm from "../../features/auth/ui/loginform";

const LoginPage = () => (
  <div className="w-full min-h-screen bg-[#f0f4f8] flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center p-6">
      <LoginForm />
    </main>
    <Footer />
  </div>
);

export default LoginPage;

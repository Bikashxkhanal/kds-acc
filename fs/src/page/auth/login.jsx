import { Header, Footer } from "../../components/index";
import LoginForm from "../../features/auth/ui/loginform";
import { useI18n } from "../../i18n/I18nProvider.jsx";

const LoginPage = () => {
  const { t } = useI18n();
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL;
  return (
  <div className="w-full min-h-screen bg-[#f0f4f8] flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center p-6">
      <LoginForm />
    </main>
    <div className="px-4 pb-5 text-center text-sm text-slate-500">
      <span>{t('auth.contactDeveloper')}</span>
      {linkedInUrl && <a className="ml-2 inline-flex items-center gap-1 font-medium text-[#0a66c2] hover:underline" href={linkedInUrl} target="_blank" rel="noopener noreferrer"><i className="bi bi-linkedin" aria-hidden="true" /> LinkedIn</a>}
    </div>
    <Footer />
  </div>
  );
};

export default LoginPage;

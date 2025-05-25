import { LoginForm } from "./_components/login-form";

const LoginPage = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="container">
        <LoginForm />
      </div>
    </div>
  );
};
export default LoginPage;

import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-8 text-center">Connexion</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login; 
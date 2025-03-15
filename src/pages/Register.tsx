import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="py-12">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-8 text-center">Inscription</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register; 
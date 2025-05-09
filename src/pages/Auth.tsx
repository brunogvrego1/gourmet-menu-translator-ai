
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (isLogin) {
        await signIn(data.email, data.password);
      } else {
        await signUp(data.email, data.password, data.firstName, data.lastName);
        // After successful signup, switch to login view
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold text-gray-900">
            {isLogin ? 'Faça login na sua conta' : 'Crie uma nova conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Nova no Tradutor Gourmet?' : 'Já tem uma conta?'}{' '}
            <button
              className="font-medium text-gourmet-purple hover:text-gourmet-dark-purple"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Crie uma conta' : 'Faça login'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    type="text"
                    className="mt-1"
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Sobrenome
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    type="text"
                    className="mt-1"
                    placeholder="Sobrenome"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Email inválido',
                  },
                })}
                type="email"
                className="mt-1"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </Label>
              <Input
                id="password"
                {...register('password', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres',
                  },
                })}
                type="password"
                className="mt-1"
                placeholder="Senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;

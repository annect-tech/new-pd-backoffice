import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface RegisterErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export default function useRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: RegisterErrors = {};

    if (!form.first_name.trim()) {
      newErrors.first_name = 'Primeiro nome é obrigatório';
    }

    if (!form.last_name.trim()) {
      newErrors.last_name = 'Último nome é obrigatório';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }

    if (!form.passwordConfirmation) {
      newErrors.passwordConfirmation = 'Confirmação de senha é obrigatória';
    } else if (form.password !== form.passwordConfirmation) {
      newErrors.passwordConfirmation = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // O registro não está disponível no backend atual
    // Apenas administradores podem criar usuários
    // Por enquanto, apenas redireciona para login
    navigate('/login');
  }, [validateForm, navigate]);

  return {
    form,
    errors,
    showPassword,
    showPasswordConfirmation,
    setShowPassword,
    setShowPasswordConfirmation,
    handleChange,
    handleSubmit,
  };
}

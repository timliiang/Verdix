import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/authSchemas';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormData) => {
        
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* username input + register('username') + errors.username?.message */}
            {/* password input — same pattern, but type="password" */}
            <button type="submit">Log In</button>
        </form>
    );
}

export default LoginPage;

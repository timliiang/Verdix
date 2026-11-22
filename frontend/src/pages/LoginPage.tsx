import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../api/apiError';
import { AuthShell, AuthStage } from '../components/auth/AuthShell';
import { useReturnTo } from '../components/auth/useReturnTo';
import { TextField } from '../components/ui/TextField';
import { FormError } from '../components/ui/FormError';
import { buttonClass } from '../components/ui/buttonClass';
import { Monogram } from '../components/home/HomeChrome';
import { recentReviews } from '../lib/homeContent';

// The stage quotes a real review from the home page data, so the panel shows what Verdix is for.
const review = recentReviews[0];

function LoginPage() {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const returnTo = useReturnTo();

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
            // replace, so Back from the next page does not return to the login form
            navigate(returnTo, { replace: true });
        } catch (err) {
            const { message, fieldErrors } = parseApiError(err);
            const fields = (['username', 'password'] as const).filter((field) => fieldErrors[field]);
            fields.forEach((field) => setError(field, { message: fieldErrors[field] }));
            // root.* errors belong to the whole form and are cleared on the next submit
            if (fields.length === 0) setError('root.server', { message });
        }
    };

    return (
        <AuthShell
            title="Log in"
            description="Pick up your ranking where you left off."
            switchPrompt={
                <>
                    New to Verdix?{' '}
                    <Link to="/register" className="rounded-inline font-semibold text-highlight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight">
                        Create an account
                    </Link>
                </>
            }
            aside={
                <AuthStage image="/movies/hero-backdrop.png">
                    <figure className="max-w-lg">
                        <blockquote className="text-heading-md font-semibold leading-[1.15] text-ink">
                            &ldquo;{review.body}&rdquo;
                        </blockquote>
                        <figcaption className="mt-8 flex items-center gap-3">
                            <Monogram name={review.author.name} avatarColor={review.author.avatarColor} />
                            <span className="flex flex-col gap-1">
                                <span className="text-link-sm text-ink">{review.author.name}</span>
                                <span className="text-meta text-ash">
                                    Placed {review.film.title} at #{review.placedAt} of {review.listSize}
                                </span>
                            </span>
                        </figcaption>
                    </figure>
                </AuthStage>
            }
        >
            <title>Log in | Verdix</title>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <TextField
                    label="Username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    error={errors.username?.message}
                    {...register('username')}
                />
                <TextField
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                />
                <FormError message={errors.root?.server?.message} />
                <button type="submit" disabled={isSubmitting} className={buttonClass('primary', 'mt-2 w-full')}>
                    {isSubmitting ? 'Logging in…' : 'Log in'}
                </button>
            </form>
        </AuthShell>
    );
}

export default LoginPage;

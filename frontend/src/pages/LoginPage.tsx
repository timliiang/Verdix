import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../context/AuthContext';
import { AuthShell, AuthStage } from '../components/auth/AuthShell';
import { TextField } from '../components/ui/TextField';
import { buttonClass } from '../components/ui/buttonClass';
import { Monogram } from '../components/home/HomeChrome';
import { recentReviews } from '../lib/homeContent';

// The stage quotes a real review from the home page data, so the panel shows what Verdix is for.
const review = recentReviews[0];

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormData) => {

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
                <button type="submit" className={buttonClass('primary', 'mt-2 w-full')}>Log in</button>
            </form>
        </AuthShell>
    );
}

export default LoginPage;

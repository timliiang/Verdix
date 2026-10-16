import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from '../schemas/authSchema';
import { AuthShell, AuthStage } from '../components/auth/AuthShell';
import { TextField } from '../components/ui/TextField';
import { buttonClass } from '../components/ui/buttonClass';
import { rankedThisWeek } from '../lib/homeContent';

// Three of this week's top-ranked posters, fanned on the stage: the product in one image.
// Sized to the stage's inner width: 3 x 128px fits the ~404px stage at lg, 3 x 160px the ~544px one at xl.
const posters = rankedThisWeek.slice(0, 3);
const fan = ['-rotate-6 translate-y-4', 'z-10 -translate-y-2', 'rotate-6 translate-y-4'];

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    // UI only: validation runs through the schema, submission is not wired up yet.
    const onSubmit: SubmitHandler<RegisterFormData> = async () => {};

    return (
        <AuthShell
            title="Create your account"
            description="Rank every film you watch, one quick comparison at a time."
            switchPrompt={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="rounded-inline font-semibold text-highlight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight">
                        Log in
                    </Link>
                </>
            }
            aside={
                <AuthStage image="/landing/night-street.jpg">
                    <div aria-hidden="true" className="mb-auto flex justify-center pt-6">
                        {posters.map((film, i) => (
                            <img
                                key={film.id}
                                src={film.posterUrl}
                                alt=""
                                width={1024}
                                height={1024}
                                loading="lazy"
                                className={`-mx-3 aspect-[2/3] w-32 rounded-xl border border-hairline-soft object-cover shadow-2xl shadow-canvas/60 xl:w-40 ${fan[i]}`}
                            />
                        ))}
                    </div>
                    <h2 className="mt-10 text-balance text-display-sm font-bold text-ink">Your taste, in order.</h2>
                    <p className="mt-3 max-w-md text-body text-graphite">
                        Verdix compares each new film against the ones you have ranked and builds the list for you.
                    </p>
                </AuthStage>
            }
        >
            <title>Create your account | Verdix</title>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <TextField
                    label="Username"
                    helper="3 to 20 characters. This is shown on your lists."
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    error={errors.username?.message}
                    {...register('username')}
                />
                <TextField
                    label="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    error={errors.email?.message}
                    {...register('email')}
                />
                <TextField
                    label="Password"
                    type="password"
                    helper="At least 6 characters."
                    autoComplete="new-password"
                    error={errors.password?.message}
                    {...register('password')}
                />
                <button type="submit" className={buttonClass('primary', 'mt-2 w-full')}>Create account</button>
            </form>
        </AuthShell>
    );
}

export default RegisterPage;

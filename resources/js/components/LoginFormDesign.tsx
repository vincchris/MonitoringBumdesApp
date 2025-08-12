import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function LoginBumdes() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#4383FF] bg-[url('/background-waves.svg')] bg-cover bg-center bg-no-repeat px-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
                <form onSubmit={submit} className="p-4 sm:p-6">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                            <img src="/assets/images/Bumdes Logo.png" alt="Logo 1" className="h-auto w-20 sm:w-24" />
                            <img src="/assets/images/SumberJaya Logo.png" alt="Logo 2" className="h-auto w-16 sm:w-20" />
                        </div>
                        <h2 className="mt-3 text-base font-semibold sm:mt-4 sm:text-lg">Masuk ke akun</h2>
                        <p className="text-center text-xs text-gray-500 sm:text-sm">
                            Tolong masukkan email dan password yang sesuai untuk masuk kedalam aplikasi
                        </p>
                    </div>

                    <div className="mt-5 space-y-4 sm:mt-6">
                        <div>
                            <Label htmlFor="email" className="text-sm">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                className="w-full text-black"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-sm">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                className="w-full text-black"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" checked={data.remember} onCheckedChange={() => setData('remember', !data.remember)} />
                            <Label htmlFor="remember" className="text-xs text-black sm:text-sm">
                                Ingat password
                            </Label>
                        </div>

                        <Button type="submit" className="w-full bg-[#4383FF] text-white hover:bg-[#3569cc]" disabled={processing}>
                            {processing ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-[10px] text-gray-500 sm:text-xs">
                        Lupa password? hubungi admin bumdes untuk merubah password anda
                    </p>
                </form>
            </div>
        </div>
    );
}

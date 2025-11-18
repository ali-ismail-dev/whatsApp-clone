import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="
                min-h-screen flex items-center justify-center
                bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                p-4
            ">
                <div className="
                    w-full max-w-md
                    backdrop-blur-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95
                    border border-slate-600/50 rounded-2xl
                    shadow-2xl shadow-blue-500/20
                    overflow-hidden
                ">
                    {/* Gradient header */}
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <ShieldCheckIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Confirm Password</h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="
                            mb-6 text-sm text-slate-300 text-center leading-relaxed
                            bg-slate-700/30 rounded-xl p-4 border border-slate-600/50
                        ">
                            <p>
                                This is a secure area of the application. Please confirm your
                                password before continuing.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel 
                                    htmlFor="password" 
                                    value="Password" 
                                    className="text-slate-200 font-medium"
                                />

                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-2 block w-full
                                        bg-slate-700/50 border-slate-600/50
                                        text-slate-200 placeholder-slate-400
                                        focus:border-cyan-500 focus:ring-cyan-500/20
                                        transition-all duration-300
                                        rounded-xl backdrop-blur-sm
                                    "
                                    isFocused={true}
                                    onChange={(e) => setData('password', e.target.value)}
                                />

                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end">
                                <PrimaryButton 
                                    className="
                                        bg-gradient-to-r from-blue-500 to-cyan-500
                                        hover:from-blue-600 hover:to-cyan-600
                                        text-white font-medium
                                        transition-all duration-300
                                        hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
                                        disabled:opacity-50 disabled:scale-100
                                        backdrop-blur-sm
                                        px-8 py-3
                                    "
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Confirming...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                            Confirm Password
                                        </div>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>

                        {/* Security notice */}
                        <div className="mt-6 p-3 bg-slate-700/30 rounded-xl border border-slate-600/50">
                            <p className="text-xs text-slate-400 text-center">
                                Your password is encrypted and secure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
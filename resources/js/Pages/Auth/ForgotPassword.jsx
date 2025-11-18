import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

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
                                <KeyIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="
                            mb-6 text-sm text-slate-300 text-center leading-relaxed
                            bg-slate-700/30 rounded-xl p-4 border border-slate-600/50
                        ">
                            <p>
                                Forgot your password? No problem. Just let us know your email
                                address and we will email you a password reset link that will
                                allow you to choose a new one.
                            </p>
                        </div>

                        {status && (
                            <div className="
                                mb-6 p-4 rounded-xl
                                bg-gradient-to-r from-green-500/20 to-emerald-500/20
                                border border-green-500/30
                                text-green-400 text-sm text-center
                                backdrop-blur-sm
                            ">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    {status}
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label 
                                    htmlFor="email" 
                                    className="
                                        block text-sm font-medium text-slate-200 mb-2
                                        flex items-center gap-2
                                    "
                                >
                                    <EnvelopeIcon className="w-4 h-4 text-cyan-400" />
                                    Email Address
                                </label>

                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="
                                        block w-full
                                        bg-slate-700/50 border-slate-600/50
                                        text-slate-200 placeholder-slate-400
                                        focus:border-cyan-500 focus:ring-cyan-500/20
                                        transition-all duration-300
                                        rounded-xl backdrop-blur-sm
                                        pl-10
                                    "
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email address"
                                />

                                <InputError message={errors.email} className="mt-2" />
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
                                        w-full justify-center
                                    "
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Sending Reset Link...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <EnvelopeIcon className="w-4 h-4 mr-2" />
                                            Email Password Reset Link
                                        </div>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>

                        {/* Additional info */}
                        <div className="mt-6 p-3 bg-slate-700/30 rounded-xl border border-slate-600/50">
                            <p className="text-xs text-slate-400 text-center">
                                Check your spam folder if you don't see the email within a few minutes
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
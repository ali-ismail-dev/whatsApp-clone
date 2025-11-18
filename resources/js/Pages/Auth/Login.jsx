import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [focusedField, setFocusedField] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleFocus = (field) => {
        setFocusedField(field);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Status Message */}
            {status && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm backdrop-blur-sm">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                    <InputLabel 
                        htmlFor="email" 
                        value="Email Address" 
                        className="text-slate-200 font-medium"
                    />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className={`w-full bg-slate-700/50 border-0 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 ${
                                focusedField === 'email' 
                                    ? 'ring-2 ring-cyan-500 bg-slate-700/70 shadow-lg' 
                                    : 'hover:bg-slate-700/60'
                            } ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            onFocus={() => handleFocus('email')}
                            onBlur={handleBlur}
                            placeholder="Enter your email address"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-600">
                            <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ${
                                focusedField === 'email' ? 'w-full' : 'w-0'
                            }`}></div>
                        </div>
                    </div>
                    <InputError message={errors.email} className="text-red-400" />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <InputLabel 
                        htmlFor="password" 
                        value="Password" 
                        className="text-slate-200 font-medium"
                    />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className={`w-full bg-slate-700/50 border-0 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 ${
                                focusedField === 'password' 
                                    ? 'ring-2 ring-cyan-500 bg-slate-700/70 shadow-lg' 
                                    : 'hover:bg-slate-700/60'
                            } ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            onFocus={() => handleFocus('password')}
                            onBlur={handleBlur}
                            placeholder="Enter your password"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-600">
                            <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ${
                                focusedField === 'password' ? 'w-full' : 'w-0'
                            }`}></div>
                        </div>
                    </div>
                    <InputError message={errors.password} className="text-red-400" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    {/* Remember Me Checkbox */}
                    <label className="flex items-center space-x-3 cursor-pointer group">
                        <div className="relative">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-5 h-5 text-cyan-500 bg-slate-700/50 border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
                            />
                            <div className="absolute inset-0 rounded border-2 border-transparent group-hover:border-cyan-400/30 transition-colors duration-200"></div>
                        </div>
                        <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors duration-200">
                            Remember me
                        </span>
                    </label>

                    {/* Forgot Password Link */}
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200 hover:underline"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <PrimaryButton 
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Signing In...
                            </div>
                        ) : (
                            'Sign In to Your Account'
                        )}
                    </PrimaryButton>
                </div>
            </form>

            {/* Additional Sign Up Link */}
            <div className="mt-8 pt-6 border-t border-slate-700/50">
                <p className="text-slate-400 text-center text-sm">
                    Don't have an account?{' '}
                    <Link 
                        href={route('register')} 
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                    >
                        Create one here
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
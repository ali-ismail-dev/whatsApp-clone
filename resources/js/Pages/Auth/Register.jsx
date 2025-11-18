import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [focusedField, setFocusedField] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
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
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <InputLabel 
                        htmlFor="name" 
                        value="Full Name" 
                        className="text-slate-200 font-medium"
                    />
                    <div className="relative">
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className={`w-full bg-slate-700/50 border-0 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 ${
                                focusedField === 'name' 
                                    ? 'ring-2 ring-cyan-500 bg-slate-700/70 shadow-lg' 
                                    : 'hover:bg-slate-700/60'
                            } ${errors.name ? 'ring-2 ring-red-500' : ''}`}
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            onFocus={() => handleFocus('name')}
                            onBlur={handleBlur}
                            placeholder="Enter your full name"
                            required
                        />
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-600">
                            <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ${
                                focusedField === 'name' ? 'w-full' : 'w-0'
                            }`}></div>
                        </div>
                    </div>
                    <InputError message={errors.name} className="text-red-400" />
                </div>

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
                            onChange={(e) => setData('email', e.target.value)}
                            onFocus={() => handleFocus('email')}
                            onBlur={handleBlur}
                            placeholder="Enter your email address"
                            required
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
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            onFocus={() => handleFocus('password')}
                            onBlur={handleBlur}
                            placeholder="Create a strong password"
                            required
                        />
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-600">
                            <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ${
                                focusedField === 'password' ? 'w-full' : 'w-0'
                            }`}></div>
                        </div>
                    </div>
                    <InputError message={errors.password} className="text-red-400" />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <InputLabel 
                        htmlFor="password_confirmation" 
                        value="Confirm Password" 
                        className="text-slate-200 font-medium"
                    />
                    <div className="relative">
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className={`w-full bg-slate-700/50 border-0 rounded-xl px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 ${
                                focusedField === 'password_confirmation' 
                                    ? 'ring-2 ring-cyan-500 bg-slate-700/70 shadow-lg' 
                                    : 'hover:bg-slate-700/60'
                            } ${errors.password_confirmation ? 'ring-2 ring-red-500' : ''}`}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            onFocus={() => handleFocus('password_confirmation')}
                            onBlur={handleBlur}
                            placeholder="Confirm your password"
                            required
                        />
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-600">
                            <div className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ${
                                focusedField === 'password_confirmation' ? 'w-full' : 'w-0'
                            }`}></div>
                        </div>
                    </div>
                    <InputError message={errors.password_confirmation} className="text-red-400" />
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
                                Creating Account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </PrimaryButton>
                </div>
            </form>
             {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link 
                            href={route('login')} 
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
        </GuestLayout>
    );
}
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import UserAvatar from '../../../Components/App/UserAvatar';
import { CameraIcon, EnvelopeIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            avatar: null,
            email: user.email,
            _method: 'PATCH',
        });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                        <UserAvatar user={user} profile={true} />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <label
                            htmlFor="avatar"
                            className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg shadow-blue-500/30"
                        >
                            <CameraIcon className="w-4 h-4 text-white" />
                            <input
                                id="avatar"
                                type="file"
                                className="hidden"
                                onChange={e => setData('avatar', e.target.files[0])}
                            />
                        </label>
                    </div>
                    
                    <div className="text-center">
                        <InputError className="mt-2" message={errors.avatar} />
                        <p className="text-sm text-slate-400 mt-2">
                            Click the camera icon to update your profile picture
                        </p>
                    </div>
                </div>

                {/* Name Input */}
                <div>
                    <InputLabel 
                        htmlFor="name" 
                        value="Full Name" 
                        className="text-slate-200 font-medium flex items-center gap-2 mb-2"
                    >
                        <UserIcon className="w-4 h-4 text-cyan-400" />
                        Full Name
                    </InputLabel>

                    <TextInput
                        id="name"
                        className="
                            mt-1 block w-full
                            bg-slate-700/50 border-slate-600/50
                            text-slate-200 placeholder-slate-400
                            focus:border-cyan-500 focus:ring-cyan-500/20
                            transition-all duration-300
                            rounded-xl backdrop-blur-sm
                            pl-4
                        "
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email Input */}
                <div>
                    <InputLabel 
                        htmlFor="email" 
                        value="Email Address" 
                        className="text-slate-200 font-medium flex items-center gap-2 mb-2"
                    >
                        <EnvelopeIcon className="w-4 h-4 text-cyan-400" />
                        Email Address
                    </InputLabel>

                    <TextInput
                        id="email"
                        type="email"
                        className="
                            mt-1 block w-full
                            bg-slate-700/50 border-slate-600/50
                            text-slate-200 placeholder-slate-400
                            focus:border-cyan-500 focus:ring-cyan-500/20
                            transition-all duration-300
                            rounded-xl backdrop-blur-sm
                            pl-4
                        "
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Email Verification Section */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="
                        p-4 rounded-xl
                        bg-gradient-to-r from-amber-500/10 to-orange-500/10
                        border border-amber-500/30
                        backdrop-blur-sm
                    ">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <EnvelopeIcon className="w-5 h-5 text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-amber-200 font-medium mb-2">
                                    Your email address is unverified.
                                </p>
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="
                                        text-sm text-amber-300 hover:text-amber-200 
                                        underline transition-colors duration-200
                                        hover:scale-105 transform
                                    "
                                >
                                    Click here to re-send the verification email.
                                </Link>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                                        <div className="flex items-center gap-2 text-green-400 text-sm">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            A new verification link has been sent to your email address.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex items-center gap-4 pt-4">
                    <PrimaryButton 
                        disabled={processing}
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
                    >
                        {processing ? (
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            'Save Changes'
                        )}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-4"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-x-4"
                    >
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircleIcon className="w-5 h-5" />
                            <span className="font-medium">Profile updated successfully!</span>
                        </div>
                    </Transition>
                </div>

                {/* Additional Info */}
                <div className="
                    p-3 rounded-xl
                    bg-slate-700/30 border border-slate-600/50
                    backdrop-blur-sm
                ">
                    <p className="text-xs text-slate-400 text-center">
                        Your profile information is secure and encrypted
                    </p>
                </div>
            </form>
        </section>
    );
}
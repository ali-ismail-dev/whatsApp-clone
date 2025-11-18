import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { UserCircleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm">
                        <UserCircleIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Profile Settings
                    </h2>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="py-8">
                    <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                        {/* Profile Information Card */}
                        <div className="
                            backdrop-blur-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            border border-slate-600/50 rounded-2xl
                            shadow-2xl shadow-blue-500/20
                            overflow-hidden
                        ">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <UserCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Profile Information</h3>
                                </div>
                                <p className="text-blue-100 text-sm mt-2">
                                    Update your account's profile information and email address.
                                </p>
                            </div>
                            <div className="p-6">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-2xl"
                                />
                            </div>
                        </div>

                        {/* Update Password Card */}
                        <div className="
                            backdrop-blur-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            border border-slate-600/50 rounded-2xl
                            shadow-2xl shadow-blue-500/20
                            overflow-hidden
                        ">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Update Password</h3>
                                </div>
                                <p className="text-blue-100 text-sm mt-2">
                                    Ensure your account is using a long, random password to stay secure.
                                </p>
                            </div>
                            <div className="p-6">
                                <UpdatePasswordForm className="max-w-2xl" />
                            </div>
                        </div>

                        {/* Delete Account Card */}
                        <div className="
                            backdrop-blur-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            border border-slate-600/50 rounded-2xl
                            shadow-2xl shadow-red-500/20
                            overflow-hidden
                        ">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Delete Account</h3>
                                </div>
                                <p className="text-red-100 text-sm mt-2">
                                    Permanently delete your account and all of its resources.
                                </p>
                            </div>
                            <div className="p-6">
                                <DeleteUserForm className="max-w-2xl" />
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="
                            backdrop-blur-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95
                            border border-slate-600/50 rounded-2xl
                            shadow-2xl shadow-blue-500/20
                            p-6 text-center
                        ">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <ShieldCheckIcon className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm">Your account security is our priority</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
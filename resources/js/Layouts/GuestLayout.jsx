import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-700/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="relative">
                            <ApplicationLogo className="h-24 w-24 mx-auto transition-transform duration-300 hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 hover:opacity-20 blur-md transition-opacity duration-300"></div>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mt-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Ali Chat
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">Connect instantly, chat forever</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <div className="p-8">
                        {children}
                    </div>
                </div>

            </div>
        </div>
    );
}
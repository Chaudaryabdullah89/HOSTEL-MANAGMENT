"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TokenHandlerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const handleToken = async () => {
            try {
                const token = searchParams.get('token');
                const userData = searchParams.get('user');

                console.log('Token handler - Token:', token ? 'Present' : 'Missing');
                console.log('Token handler - User data:', userData ? 'Present' : 'Missing');

                if (!token) {
                    setStatus('error');
                    setMessage('No authentication token provided');
                    return;
                }

                // Set the token as a cookie (removed secure flag for localhost)
                document.cookie = `token=${token}; path=/; max-age=86400; samesite=strict`;
                console.log('Cookie set:', document.cookie);

                // If user data is provided, store it in localStorage
                if (userData) {
                    try {
                        const decodedUser = decodeURIComponent(userData);
                        localStorage.setItem('user', decodedUser);
                        localStorage.setItem('auth_token', token);
                        console.log('User data stored in localStorage');
                    } catch (e) {
                        console.warn('Could not decode user data:', e);
                    }
                }

                setStatus('success');
                setMessage('Authentication successful! Redirecting to dashboard...');

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    console.log('Redirecting to dashboard...');
                    router.push('/dashboard');
                }, 2000);

            } catch (error) {
                console.error('Token handling error:', error);
                setStatus('error');
                setMessage('Authentication failed. Please try logging in manually.');
            }
        };

        handleToken();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <div className="mb-4">
                        {status === 'processing' && (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        )}
                        {status === 'success' && (
                            <div className="text-green-600 text-4xl">✓</div>
                        )}
                        {status === 'error' && (
                            <div className="text-red-600 text-4xl">✗</div>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {status === 'processing' && 'Processing Authentication'}
                        {status === 'success' && 'Authentication Successful'}
                        {status === 'error' && 'Authentication Failed'}
                    </h2>

                    <p className="text-gray-600 mb-4">{message}</p>

                    {status === 'error' && (
                        <div className="space-y-2">
                            <a
                                href="/auth/signin"
                                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Go to Login
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TokenHandlerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <TokenHandlerContent />
        </Suspense>
    );
}

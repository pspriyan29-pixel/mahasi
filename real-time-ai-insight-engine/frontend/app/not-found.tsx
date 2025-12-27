import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        404
                    </h1>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-400 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>

                    <Link href="/dashboard">
                        <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto">
                            <Search className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

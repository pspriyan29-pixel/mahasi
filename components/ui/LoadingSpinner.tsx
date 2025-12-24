interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'white' | 'gray';
    overlay?: boolean;
}

export default function LoadingSpinner({
    size = 'md',
    color = 'primary',
    overlay = false
}: LoadingSpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4',
    };

    const colors = {
        primary: 'border-purple-500 border-t-transparent',
        white: 'border-white border-t-transparent',
        gray: 'border-gray-400 border-t-transparent',
    };

    const spinner = (
        <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}></div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="glass-strong rounded-2xl p-8 flex flex-col items-center gap-4">
                    {spinner}
                    <p className="text-gray-300 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return spinner;
}

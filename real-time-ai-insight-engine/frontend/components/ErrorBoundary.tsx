'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
        return { hasError: true, error: _error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // eslint-disable-next-line no-console
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="max-w-md w-full glass">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                                <CardTitle>Something went wrong</CardTitle>
                            </div>
                            <CardDescription>
                                An error occurred while rendering this component
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {this.state.error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm font-mono text-red-400">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                            <Button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="w-full"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

// Functional wrapper for easier use
export function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
    return <ErrorBoundary>{children}</ErrorBoundary>
}

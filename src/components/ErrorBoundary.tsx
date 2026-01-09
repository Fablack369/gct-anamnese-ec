import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
                    <div className="max-w-md w-full space-y-6 text-center animate-fade-in">
                        <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
                            <AlertTriangle className="w-10 h-10 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold font-display text-gradient-gold">
                                Algo deu errado
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Desculpe, ocorreu um erro inesperado no aplicativo.
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-card border border-border text-left overflow-auto max-h-48 text-xs font-mono opacity-80">
                            <p className="text-destructive font-semibold mb-2">
                                {this.state.error?.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <pre className="text-muted-foreground whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            variant="gold"
                            className="w-full gap-2"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Tentar Novamente
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

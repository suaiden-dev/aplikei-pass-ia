import { ReactNode } from "react";

interface AdminStatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: ReactNode;
    trend?: { value: string; positive: boolean };
}

export function AdminStatCard({
    title,
    value,
    description,
    icon,
    trend,
}: AdminStatCardProps) {
    return (
        <div className="rounded-md border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 font-display text-title font-bold text-foreground">
                        {value}
                    </p>
                    {description && (
                        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                    )}
                    {trend && (
                        <p
                            className={`mt-1 text-xs font-medium ${trend.positive ? "text-green-500" : "text-red-500"
                                }`}
                        >
                            {trend.positive ? "↑" : "↓"} {trend.value}
                        </p>
                    )}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                    {icon}
                </div>
            </div>
        </div>
    );
}

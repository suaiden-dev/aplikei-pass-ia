import { Construction } from "lucide-react";

interface AdminPlaceholderProps {
    title: string;
    description?: string;
}

export default function AdminPlaceholder({
    title,
    description = "Esta seção está em desenvolvimento.",
}: AdminPlaceholderProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <Construction className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 font-display text-subtitle font-bold text-foreground">
                {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

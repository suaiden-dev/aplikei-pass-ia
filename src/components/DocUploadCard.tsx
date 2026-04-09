import { useRef } from "react";
import { 
  RiUploadCloud2Line, 
  RiCheckDoubleLine, 
  RiErrorWarningLine 
} from "react-icons/ri";

export interface DocFile {
  file: File | null;
  label: string;
  path?: string;
}

interface DocUploadCardProps {
  docKey: string;
  title: string;
  subtitle?: string;
  doc: DocFile;
  onChange: (key: string, file: File) => void;
  isReadOnly?: boolean;
  isRejected?: boolean;
}

export function DocUploadCard({ docKey, title, subtitle, doc, onChange, isReadOnly, isRejected }: DocUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isUploaded = !!doc.file || !!doc.path;
  const isCorrecting = !!doc.file; // User just selected a new local file
  const showAsRejected = isRejected && !isCorrecting;

  return (
    <div className="flex flex-col h-full">
      <button
        type="button"
        onClick={() => !isReadOnly && inputRef.current?.click()}
        disabled={isReadOnly}
        className={`group relative w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-between p-6 transition-all min-h-[220px] ${
          showAsRejected
            ? "border-red-500 bg-red-50/50 shadow-lg shadow-red-100"
            : isUploaded
              ? "border-emerald-400 bg-emerald-50/50"
              : "border-slate-200 hover:border-primary hover:bg-blue-50/30 bg-white"
        } ${isReadOnly ? "cursor-default opacity-80" : "cursor-pointer"}`}
      >
        <div className="flex-1 flex flex-col items-center justify-center w-full text-center">
          {showAsRejected ? (
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3 animate-pulse shadow-sm">
              <RiErrorWarningLine className="text-3xl text-red-500" />
            </div>
          ) : isUploaded ? (
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3 shadow-inner">
              <RiCheckDoubleLine className="text-3xl text-emerald-500" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <RiUploadCloud2Line className="text-3xl text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          )}
          <span className={`text-[10px] font-black uppercase tracking-widest text-center px-2 ${
            showAsRejected ? "text-red-600" : isUploaded ? "text-emerald-600" : "text-slate-400 group-hover:text-primary"
          }`}>
            {showAsRejected ? "Needs Correction" : isUploaded ? (isCorrecting ? "New File Selected" : "File Selected") : "Upload File"}
          </span>
        </div>

        <div className="w-full pt-4 border-t border-slate-100 mt-4 text-left">
          <p className="text-[11px] font-black leading-tight truncate uppercase tracking-tight text-slate-800">{title}</p>
          {subtitle ? (
            <p className="text-[9px] text-slate-400 font-bold mt-0.5 leading-snug line-clamp-2 uppercase tracking-tighter italic">{subtitle}</p>
          ) : (
             <p className="text-[9px] text-slate-300 font-bold mt-0.5 leading-snug uppercase tracking-tighter italic">Required Document</p>
          )}
        </div>

        {showAsRejected ? (
          <div className="absolute top-3 right-3 flex gap-1">
            <span className="text-[8px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
              PENDING
            </span>
          </div>
        ) : isUploaded ? (
          <div className="absolute top-3 right-3 flex gap-1">
            <span className={`text-[8px] font-black ${isCorrecting ? 'bg-amber-500' : 'bg-emerald-500'} text-white px-2 py-0.5 rounded-full shadow-sm`}>
              {isCorrecting ? "UPDATED" : "READY"}
            </span>
          </div>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) onChange(docKey, f);
        }}
      />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bold, Italic, Palette, AlignLeft, AlignCenter, AlignRight, List } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

export function RichTextEditor({ value, onChange, placeholder, label }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [color, setColor] = useState('#000000');
    const [isColorOpen, setIsColorOpen] = useState(false);

    // Sync external value to editor content (only if different to avoid cursor jumping)
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            // Only update if it's empty or initial load to prevent loop, 
            // but for a controlled component we might need more complex logic.
            // For simplicity, we'll only set if empty or completely different and not focused?
            // Actually, contentEditable controlled is hard.
            // Let's just set it once on mount or if value changes substantially?
            // A common pattern: if (editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
            // But this resets cursor. 
            // We will rely on internal state for updates and only upstream on blur or specific input events.

            // Simplified approach: just set it if focused is false? 
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus(); // Keep focus
            onChange(editorRef.current.innerHTML);
        }
    };

    const colors = [
        '#000000', '#4B5563', '#DC2626', '#EA580C', '#D97706', '#65A30D', '#16A34A',
        '#059669', '#0891B2', '#2563EB', '#4F46E5', '#7C3AED', '#9333EA', '#DB2777', '#822A88'
    ];

    return (
        <div className="space-y-2 relative">
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
            <div className="border rounded-md shadow-sm bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-1 border-b bg-muted/20 flex-wrap relative z-20">
                    <Button variant="ghost" size="sm" onClick={() => execCommand('bold')} className="h-8 w-8 p-0" title="Negrita">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => execCommand('italic')} className="h-8 w-8 p-0" title="Cursiva">
                        <Italic className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Color de texto"
                            onClick={() => setIsColorOpen(!isColorOpen)}
                        >
                            <Palette className="h-4 w-4" style={{ color: color }} />
                        </Button>

                        {isColorOpen && (
                            <div className="absolute top-full left-0 mt-1 p-2 bg-popover border rounded-md shadow-md grid grid-cols-5 gap-1 w-48 z-50">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                        onClick={() => {
                                            setColor(c);
                                            execCommand('foreColor', c);
                                            setIsColorOpen(false);
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        {/* Overlay to close */}
                        {isColorOpen && (
                            <div className="fixed inset-0 z-40" onClick={() => setIsColorOpen(false)} />
                        )}
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => execCommand('fontSize', '3')} className="h-8 w-8 p-0" title="Tamaño Normal">
                        <span className="text-xs">A</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => execCommand('fontSize', '5')} className="h-8 w-8 p-0" title="Tamaño Grande">
                        <span className="text-lg font-bold">A</span>
                    </Button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <Button variant="ghost" size="sm" onClick={() => execCommand('justifyLeft')} className="h-8 w-8 p-0" title="Alinear Izquierda">
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => execCommand('justifyCenter')} className="h-8 w-8 p-0" title="Centrar">
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => execCommand('justifyRight')} className="h-8 w-8 p-0" title="Alinear Derecha">
                        <AlignRight className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <Button variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')} className="h-8 w-8 p-0" title="Lista">
                        <List className="h-4 w-4" />
                    </Button>
                </div>

                {/* Editor Area */}
                <div
                    ref={editorRef}
                    className="min-h-[100px] p-4 outline-none prose prose-sm max-w-none text-foreground"
                    contentEditable
                    onInput={handleInput}
                    data-placeholder={placeholder}
                    style={{ whiteSpace: 'pre-wrap' }}
                />
            </div>
            {/* Style for placeholder in contentEditable */}
            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                    display: block; /* For Firefox */
                }
            `}</style>
        </div>
    );
}

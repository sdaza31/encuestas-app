
"use client"

import * as React from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Code } from "lucide-react"

interface ShareModalProps {
    isOpen: boolean
    onClose: () => void
    surveyId: string
}

export function ShareModal({ isOpen, onClose, surveyId }: ShareModalProps) {
    const [copiedLink, setCopiedLink] = React.useState(false)
    const [copiedEmbed, setCopiedEmbed] = React.useState(false)

    const getShareUrl = () => {
        if (typeof window === 'undefined') return ''
        const basePath = window.location.pathname.includes('/encuestas-app') ? '/encuestas-app' : '';
        return `${window.location.origin}${basePath}/survey?id=${surveyId}`;
    }

    const shareUrl = getShareUrl()
    const embedCode = `<iframe src="${shareUrl}" width="100%" height="600px" frameborder="0"></iframe>`

    const copyToClipboard = async (text: string, setCopied: (val: boolean) => void) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy class', err)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Compartir Encuesta">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="share-link">Enlace Público</Label>
                    <div className="flex gap-2">
                        <Input
                            id="share-link"
                            value={shareUrl}
                            readOnly
                            className="bg-muted"
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(shareUrl, setCopiedLink)}
                            title="Copiar enlace"
                        >
                            {copiedLink ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Comparte este enlace directamente con tus usuarios.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="embed-code">Código para Insertar (Embed)</Label>
                    <div className="relative">
                        <textarea
                            id="embed-code"
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            value={embedCode}
                            readOnly
                        />
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => copyToClipboard(embedCode, setCopiedEmbed)}
                            title="Copiar código embed"
                        >
                            {copiedEmbed ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Code className="h-4 w-4" /> Copia y pega este código HTML en tu sitio web.
                    </p>
                </div>
            </div>
        </Modal>
    )
}

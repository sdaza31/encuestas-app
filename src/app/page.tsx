import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Encuestas App</h1>
        <p className="text-lg text-slate-600">
          Crea encuestas personalizadas y recopila respuestas en tiempo real.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link href="/admin/login">
            <Button size="lg">Soy Administrador</Button>
          </Link>
          {/* Future: Add button to list public surveys if implemented */}
        </div>
      </div>
    </main>
  )
}

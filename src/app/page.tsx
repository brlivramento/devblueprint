
import { FolderKanban, ListTodo, ClipboardList, Clock3 } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const stats = [
  { title: "Projetos ativos", value: "0", icon: FolderKanban },
  { title: "Tarefas abertas", value: "0", icon: ListTodo },
  { title: "Briefings", value: "0", icon: ClipboardList },
  { title: "Pendências", value: "0", icon: Clock3 },
]

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Planeje, desenvolva e acompanhe seus projetos.
          </p>
        </div>

        <Button disabled>
          Novo projeto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-semibold">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Projetos recentes</CardTitle>
          <Badge variant="secondary">0 projetos</Badge>
        </CardHeader>

        <CardContent className="py-10 text-center">
          <FolderKanban className="mx-auto mb-3 size-8 text-muted-foreground" />

          <p className="font-medium">
            Nenhum projeto cadastrado
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Seus projetos aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

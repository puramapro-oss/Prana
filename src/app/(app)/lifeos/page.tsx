import { InboxList } from "@/components/lifeos/inbox-list"

export const metadata = {
  title: "LifeOS · Inbox",
  description: "Tes captures, en attente de tri.",
}

export default function LifeosInboxPage() {
  return (
    <div className="container-calm py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-prose">
          Tout ce que tu captures atterrit ici. Je trie en quelques secondes —
          tâches, notes, projets, personnes — chacun dans sa vue.
        </p>
      </div>
      <InboxList />
    </div>
  )
}

import { CaptureFAB } from "@/components/lifeos/capture-fab"
import { LifeosTabs } from "./lifeos-tabs"

export default function LifeosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LifeosTabs />
      {children}
      <CaptureFAB />
    </>
  )
}

import { TwinTabs } from "./twin-tabs"

export default function TwinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TwinTabs />
      {children}
    </>
  )
}

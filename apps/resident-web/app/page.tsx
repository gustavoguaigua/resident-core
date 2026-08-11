import { ScaffoldStatus } from "../components/scaffold-status";
import { scaffoldMetadata } from "../lib/scaffold";

export default function HomePage() {
  return (
    <main>
      <ScaffoldStatus application="RESIDENT" phase={scaffoldMetadata.phase} />
    </main>
  );
}

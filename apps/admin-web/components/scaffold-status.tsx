interface ScaffoldStatusProps {
  application: string;
  phase: string;
}

export function ScaffoldStatus({ application, phase }: ScaffoldStatusProps) {
  return (
    <section className="scaffold-status">
      <h1>{application}</h1>
      <p>{phase}: fundamento técnico activo, sin flujos funcionales.</p>
    </section>
  );
}

export default function ComponentDetailPage({ params }: { params: { id: string } }) {
  return <h1>Dettaglio componente {params.id}</h1>
}

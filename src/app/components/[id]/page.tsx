type ComponentPageProps = {
  params: {
    id: string
  }
}

export default async function Page({ params }: any) {
  const { id } = params
  return (
    <div>
      <h1>Componente {id}</h1>
    </div>
  )
}


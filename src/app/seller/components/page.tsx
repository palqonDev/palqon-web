"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/supabaseClient"
import styles from "./SellerComponents.module.css"

export default function SellerComponents() {
  const [components, setComponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingComponent, setEditingComponent] = useState<any>(null)

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterIndoor, setFilterIndoor] = useState(false)
  const [filterOutdoor, setFilterOutdoor] = useState(false)
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [sortOrder, setSortOrder] = useState("AZ")

  const filteredComponents = components
  .filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase())

    const matchType = filterType === "ALL" || c.type === filterType
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus
    const matchIndoor = !filterIndoor || c.indoor
    const matchOutdoor = !filterOutdoor || c.outdoor

    const matchPriceMin = !priceMin || (c.price_1day || 0) >= Number(priceMin)
    const matchPriceMax = !priceMax || (c.price_1day || 0) <= Number(priceMax)

    return (
      matchSearch &&
      matchType &&
      matchStatus &&
      matchIndoor &&
      matchOutdoor &&
      matchPriceMin &&
      matchPriceMax
    )
  })
  .sort((a, b) => {
    switch (sortOrder) {
      case "AZ": return a.name.localeCompare(b.name)
      case "ZA": return b.name.localeCompare(a.name)
      case "PRICE_ASC": return (a.price_1day || 0) - (b.price_1day || 0)
      case "PRICE_DESC": return (b.price_1day || 0) - (a.price_1day || 0)
      case "NEWEST": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "OLDEST": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      default: return 0
    }
  })

const [showBundleForm, setShowBundleForm] = useState(false)
const [bundleData, setBundleData] = useState<any>({})
const [searchBundle, setSearchBundle] = useState("")
const [selectedComponents, setSelectedComponents] = useState<any[]>([])
const [totalOriginal, setTotalOriginal] = useState(0)
const [totalDiscounted, setTotalDiscounted] = useState(0)
const [bundleImages, setBundleImages] = useState<File[]>([])
const [bundlePreviewUrls, setBundlePreviewUrls] = useState<string[]>([])

const toggleComponentInBundle = (comp: any) => {
  let updated
  if (selectedComponents.some((sc) => sc.id === comp.id)) {
    updated = selectedComponents.filter((sc) => sc.id !== comp.id)
  } else {
    updated = [...selectedComponents, comp]
  }
  setSelectedComponents(updated)

  // aggiorna totali
  const original = updated.reduce((sum, sc) => sum + (sc.price_original || 0), 0)
  const discounted = updated.reduce((sum, sc) => sum + (sc.price_1day || 0), 0)
  setTotalOriginal(original)
  setTotalDiscounted(discounted)
}

const removeFromBundle = (id: string) => {
  const updated = selectedComponents.filter((sc) => sc.id !== id)
  setSelectedComponents(updated)

  const original = updated.reduce((sum, sc) => sum + (sc.price_original || 0), 0)
  const discounted = updated.reduce((sum, sc) => sum + (sc.price_1day || 0), 0)
  setTotalOriginal(original)
  setTotalDiscounted(discounted)
}

const removeBundleImage = (i: number) => {
  const updated = [...bundleImages]
  const updatedUrls = [...bundlePreviewUrls]
  updated.splice(i, 1)
  updatedUrls.splice(i, 1)
  setBundleImages(updated)
  setBundlePreviewUrls(updatedUrls)
}

const handleSaveBundle = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  if (!bundleData.name || selectedComponents.length === 0) {
    alert("Devi inserire un nome e almeno un componente")
    return
  }

  try {
    // 1. Prepara immagini
    let imageUrls: string[] = []
    if (bundleImages.length > 0) {
      for (const file of bundleImages) {
        const filePath = `bundles/${session.user.id}/${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from("components-images")
          .upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicUrl } = supabase
          .storage
          .from("components-images")
          .getPublicUrl(filePath)
        if (publicUrl?.publicUrl) imageUrls.push(publicUrl.publicUrl)
      }
    }

    let bundleId: string | null = null

    if (bundleData.id) {
      // 2a. Aggiornamento bundle esistente
      const { error: updateError } = await supabase
        .from("components")
        .update({
          name: bundleData.name,
          description: bundleData.description,
          price_original: bundleData.price_original || totalOriginal,
          price_1day: bundleData.price_1day || totalDiscounted,
          free_radius_km: bundleData.free_radius_km || null,
          extra_cost_per_km: bundleData.extra_cost_per_km || null,
          indoor: bundleData.indoor || false,
          outdoor: bundleData.outdoor || false,
          peso: bundleData.peso ? Number(bundleData.peso) : null,
          assorbimento: bundleData.assorbimento ? Number(bundleData.assorbimento) : null,
          images: imageUrls.length > 0 ? imageUrls : bundleData.images || [],
        })
        .eq("id", bundleData.id)

      if (updateError) throw updateError
      bundleId = bundleData.id

      // Elimina vecchie relazioni e reinserisci
      await supabase.from("bundle_components").delete().eq("bundle_id", bundleId)
    } else {
      // 2b. Creazione nuovo bundle
      const { data: inserted, error: insertError } = await supabase
        .from("components")
        .insert([{
          seller_id: session.user.id,
          type: "BUNDLE",
          name: bundleData.name,
          description: bundleData.description,
          price_original: bundleData.price_original || totalOriginal,
          price_1day: bundleData.price_1day || totalDiscounted,
          free_radius_km: bundleData.free_radius_km || null,
          extra_cost_per_km: bundleData.extra_cost_per_km || null,
          indoor: bundleData.indoor || false,
          outdoor: bundleData.outdoor || false,
          peso: bundleData.peso ? Number(bundleData.peso) : null,
          assorbimento: bundleData.assorbimento ? Number(bundleData.assorbimento) : null,
          images: imageUrls,
          status: "active",
        }])
        .select("id")
        .single()

      if (insertError) throw insertError
      bundleId = inserted.id
    }

    // 3. Inserisci le relazioni nella tabella bundle_components
    if (bundleId) {
      const relations = selectedComponents.map(sc => ({
        bundle_id: bundleId,
        component_id: sc.id,
        quantity: 1
      }))

      const { error: relError } = await supabase.from("bundle_components").insert(relations)
      if (relError) throw relError
    }

    alert(bundleData.id ? "Bundle aggiornato ✅" : "Bundle creato ✅")

    // Reset stati
    setShowBundleForm(false)
    setBundleData({})
    setSelectedComponents([])
    setBundleImages([])
    setBundlePreviewUrls([])
    fetchComponents() // ricarica lista
  } catch (err: any) {
    console.error("Errore bundle:", err.message || err)
    alert("Errore: " + (err.message || err))
  }
}


const fetchBundles = async () => {
  try {
    const { data, error } = await supabase
      .from("components")
      .select(`
        id,
        name,
        description,
        price_original,
        price_1day,
        images,
        type,
        bundle_components (
          component_id,
          components (
            id,
            name,
            type,
            price_original,
            price_1day,
            images
          )
        )
      `)
      .eq("type", "BUNDLE")

    if (error) throw error
    console.log("Bundle caricati:", data)
    return data
  } catch (err) {
    console.error("Errore fetchBundles:", err)
    return []
  }
}

const fetchBundleDetails = async (bundleId: string) => {
  const { data, error } = await supabase
    .from("bundle_components")
    .select(`
      component_id,
      components (*)
    `)
    .eq("bundle_id", bundleId)

  if (!error && data) {
    setSelectedComponents(data.map((d) => d.components))
  }
}






  const emptyForm = {
    name: "",
    type: "PALCHI",
    brand: "",
    power_kw: "",
    phase: "",
    connector: "",
    description: "",
    price_original: "",
    price_1day: "",
    free_radius_km: "",
    extra_cost_per_km: "",
    indoor: false,
    outdoor: false,
    status: "active",
    lunghezza: "",
    larghezza: "",
    altezza: "",
    peso: "",
    tipologia: "",
    assorbimento: "",
    controllo: "",
    pax: "",
    spl: "",
    risposta: "",
    genere: "",
    durata: "",
    console: false,
    attrezzatura: "",
    quantita: "",
    materiale: "",
      location_address: "",
  location_city: "",
  location_capacity: "",
  location_surface: "",
  location_services: "",
  location_rules: "",

  }

  const [formData, setFormData] = useState<any>(emptyForm)

  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [currency] = useState("€")

  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [activeTab, setActiveTab] = useState<string>("PALCHI")

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    const { data, error } = await supabase
      .from("components")
      .select("*")
      .eq("seller_id", session.user.id)
      .order("created_at", { ascending: false })
    if (!error) setComponents(data || [])
    setLoading(false)
  }

  const normalize = (val: any) => (val === "" || val === undefined ? null : val)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return

    try {
      let payload: any = {
        seller_id: session.user.id,
        type: formData.type,
        name: formData.name,
        description: formData.description,
        price_original: normalize(formData.price_original),
        price_1day: normalize(formData.price_1day),
        free_radius_km: normalize(formData.free_radius_km),
        extra_cost_per_km: normalize(formData.extra_cost_per_km),
        indoor: formData.indoor,
        outdoor: formData.outdoor,
      }

      switch (formData.type) {
        case "PALCHI":
          Object.assign(payload, {
            lunghezza: normalize(formData.lunghezza),
            larghezza: normalize(formData.larghezza),
            altezza: normalize(formData.altezza),
            peso: normalize(formData.peso),
            brand: formData.brand,
          })
          break
        case "LUCI":
          Object.assign(payload, {
            tipologia: formData.tipologia,
            peso: normalize(formData.peso),
            phase: formData.phase,
            assorbimento: normalize(formData.assorbimento),
            controllo: formData.controllo,
            brand: formData.brand,
          })
          break
        case "AUDIO":
          Object.assign(payload, {
            brand: formData.brand,
            power_kw: normalize(formData.power_kw),
            pax: normalize(formData.pax),
            spl: normalize(formData.spl),
            tipologia: formData.tipologia,
            risposta: formData.risposta,
          })
          break

          case "LOCATION":
  Object.assign(payload, {
    location_address: formData.location_address,
    location_city: formData.location_city,
    location_capacity: normalize(formData.location_capacity),
    location_surface: normalize(formData.location_surface),
    location_services: formData.location_services,
    location_rules: formData.location_rules,
  })
  break

case "ARTISTI":
  Object.assign(payload, {
    genere: formData.genere,
    durata: normalize(formData.durata),
    console: formData.console,
    console_modello: formData.console_modello, // 👈 nuovo campo
    attrezzatura: formData.attrezzatura,
  })
  break

        case "ALTRO":
          Object.assign(payload, {
            tipologia: formData.tipologia,
            quantita: normalize(formData.quantita),
            peso: normalize(formData.peso),
            materiale: formData.materiale,
            brand: formData.brand,
          })
          break
      }

      let imageUrls: string[] = []
      if (images.length > 0) {
        for (const file of images) {
          const filePath = `components/${session.user.id}/${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from("components-images")
            .upload(filePath, file, { upsert: true })
          if (uploadError) throw uploadError
          const { data: publicUrl } = supabase
            .storage
            .from("components-images")
            .getPublicUrl(filePath)
          if (publicUrl?.publicUrl) imageUrls.push(publicUrl.publicUrl)
        }
      } else if (editingComponent) {
        imageUrls = editingComponent.images || []
      }
      payload.images = imageUrls

      if (editingComponent) {
        const { error } = await supabase.from("components").update(payload).eq("id", editingComponent.id)
        if (error) throw error
        alert("Componente aggiornato ✅")
      } else {
        const { error } = await supabase.from("components").insert([payload])
        if (error) throw error
        alert("Componente aggiunto ✅")
      }

      setFormData(emptyForm)
      setImages([])
      setPreviewUrls([])
      setEditingComponent(null)
      setShowForm(false)
      fetchComponents()
    } catch (err: any) {
      console.error("Errore:", err.message || err)
      alert("Errore: " + (err.message || err))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Vuoi davvero eliminare questo componente?")) return
    const { error } = await supabase.from("components").delete().eq("id", id)
    if (!error) {
      alert("Componente eliminato 🗑️")
      fetchComponents()
    }
  }

  const handleEdit = (comp: any) => {
    setEditingComponent(comp)
    setFormData(comp)
    setPreviewUrls(comp.images || [])
    setShowForm(true)
    setActiveTab(comp.type || "PALCHI")
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    await supabase.from("components").update({ status: newStatus }).eq("id", id)
    fetchComponents()
  }

  const nextImage = (id: string, total: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? (prev[id] + 1) % total : 1
    }))
  }

  const prevImage = (id: string, total: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [id]: prev[id] !== undefined
        ? (prev[id] - 1 + total) % total
        : total - 1
    }))
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) return <p>Caricamento...</p>

  return (
    <div className={styles.sellerDashboard}>
<header className={styles.header}>
  <h2>I miei componenti</h2>
  <div style={{ display: "flex", gap: "0.8rem" }}>
    <button
      className={styles.addBtn}
      onClick={() => {
        setEditingComponent(null)
        setFormData(emptyForm)
        setImages([])
        setPreviewUrls([])
        setActiveTab("PALCHI")
        setShowForm(true)
      }}
    >
      Crea un nuovo componente
    </button>

    <button
      className={styles.bundleBtn}  // 👈 stile viola lo facciamo nel CSS
      onClick={() => {
        setBundleData({})
        setSelectedComponents([])
        setTotalOriginal(0)
        setTotalDiscounted(0)
        setShowBundleForm(true)
      }}
    >
      Crea nuovo Bundle
    </button>
  </div>
</header>


<div className={styles.toolbar}>
  {/* Riga sopra: search */}
  <div className={styles.toolbarTop}>
    <input
      type="text"
      placeholder="Cerca nome o descrizione..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className={styles.searchInput}
    />
  </div>

  {/* Riga sotto: filtri */}
  <div className={styles.toolbarBottom}>
    <select
      value={filterType}
      onChange={(e) => setFilterType(e.target.value)}
      className={styles.selectStyled}
    >
      <option value="ALL">Tutte le categorie</option>
      <option value="PALCHI">Palchi</option>
      <option value="LUCI">Luci</option>
      <option value="AUDIO">Audio</option>
      <option value="ARTISTI">Artisti</option>
      <option value="ALTRO">Altro</option>
    </select>

    <select
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
      className={styles.selectStyled}
    >
      <option value="ALL">Tutti</option>
      <option value="active">Attivi</option>
      <option value="inactive">Inattivi</option>
    </select>
    
<label className={styles.checkLabel}>
  <input
    type="checkbox"
    checked={filterIndoor}
    onChange={(e) => setFilterIndoor(e.target.checked)}
  />
  <span className={styles.customCheck}></span>
  Indoor
</label>

<label className={styles.checkLabel}>
  <input
    type="checkbox"
    checked={filterOutdoor}
    onChange={(e) => setFilterOutdoor(e.target.checked)}
  />
  <span className={styles.customCheck}></span>
  Outdoor
</label>



    <input
      type="number"
      placeholder="Prezzo min"
      value={priceMin}
      onChange={(e) => setPriceMin(e.target.value)}
      className={styles.priceInput}
    />

    <input
      type="number"
      placeholder="Prezzo max"
      value={priceMax}
      onChange={(e) => setPriceMax(e.target.value)}
      className={styles.priceInput}
    />

    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value)}
      className={styles.selectStyled}
    >
      <option value="AZ">Nome A-Z</option>
      <option value="ZA">Nome Z-A</option>
      <option value="PRICE_ASC">Prezzo crescente</option>
      <option value="PRICE_DESC">Prezzo decrescente</option>
      <option value="NEWEST">Più recenti</option>
      <option value="OLDEST">Meno recenti</option>
    </select>

    <button
      type="button"
      onClick={() => {
        setSearch("")
        setFilterType("ALL")
        setFilterStatus("ALL")
        setFilterIndoor(false)
        setFilterOutdoor(false)
        setPriceMin("")
        setPriceMax("")
        setSortOrder("AZ")
      }}
      className={styles.resetBtn}
    >
      Reset
    </button>
  </div>
</div>



      {/* LISTA COMPONENTI */}
      <div className={styles.grid}>
        {filteredComponents.length > 0 ? (
          filteredComponents.map((c) => (
            <div key={c.id} className={styles.componentWrapper}>
              <div className={`${styles.componentCard} ${c.status === "inactive" ? styles.inactiveCard : ""}`}>
                <h3 className={styles.componentTitle}>{c.name}</h3>

                <div className={styles.cardGrid}>
                  <div className={styles.imageWrapper}>
                    {c.images && c.images.length > 0 ? (
                      <>
                        <img
                          src={c.images[currentImageIndex[c.id] ?? 0]}
                          alt={c.name}
                          className={styles.componentImg}
                        />
                        {c.images.length > 1 && (
                          <>
                            <button className={`${styles.arrow} ${styles.left}`} onClick={() => prevImage(c.id, c.images.length)}>‹</button>
                            <button className={`${styles.arrow} ${styles.right}`} onClick={() => nextImage(c.id, c.images.length)}>›</button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className={styles.placeholder}>Nessuna immagine</div>
                    )}
                  </div>

                  <div className={styles.infoColumn}>
                    {c.type === "LOCATION" && (
  <>
    {c.location_address && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Indirizzo:</span>
        <span className={styles.value}>{c.location_address}</span>
      </div>
    )}
    {c.location_city && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Città:</span>
        <span className={styles.value}>{c.location_city}</span>
      </div>
    )}
    {c.location_capacity && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Capienza:</span>
        <span className={styles.value}>{c.location_capacity} persone</span>
      </div>
    )}
    {c.location_surface && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Superficie:</span>
        <span className={styles.value}>{c.location_surface} m²</span>
      </div>
    )}
    {c.location_services && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Servizi:</span>
        <span className={styles.value}>{c.location_services}</span>
      </div>
    )}
    {c.location_rules && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Regole:</span>
        <span className={styles.value}>{c.location_rules}</span>
      </div>
    )}
  </>
)}


                    {c.type === "PALCHI" && (
                      <>
                        {c.lunghezza && <div className={styles.infoRow}><span className={styles.label}>Lunghezza:</span><span className={styles.value}>{c.lunghezza} m</span></div>}
                        {c.larghezza && <div className={styles.infoRow}><span className={styles.label}>Larghezza:</span><span className={styles.value}>{c.larghezza} m</span></div>}
                        {c.altezza && <div className={styles.infoRow}><span className={styles.label}>Altezza:</span><span className={styles.value}>{c.altezza} m</span></div>}
                        {c.peso && <div className={styles.infoRow}><span className={styles.label}>Peso:</span><span className={styles.value}>{c.peso} kg</span></div>}
                        {c.brand && <div className={styles.infoRow}><span className={styles.label}>Marchio:</span><span className={styles.value}>{c.brand}</span></div>}
                        {c.free_radius_km && (<div className={styles.infoRow}><span className={styles.label}>Trasporto incluso entro:</span><span className={styles.value}>{c.free_radius_km} km</span></div>)}
                        {c.extra_cost_per_km && (<div className={styles.infoRow}><span className={styles.label}>Extra costo per km:</span><span className={styles.value}>{currency} {c.extra_cost_per_km}</span></div>)}
                      </>
                    )}
                    {c.type === "LUCI" && (
                      <>
                        {c.tipologia && <div className={styles.infoRow}><span className={styles.label}>Tipologia:</span><span className={styles.value}>{c.tipologia}</span></div>}
                        {c.peso && <div className={styles.infoRow}><span className={styles.label}>Peso:</span><span className={styles.value}>{c.peso} kg</span></div>}
                        {c.phase && <div className={styles.infoRow}><span className={styles.label}>Alimentazione:</span><span className={styles.value}>{c.phase}</span></div>}
                        {c.assorbimento && <div className={styles.infoRow}><span className={styles.label}>Assorbimento:</span><span className={styles.value}>{c.assorbimento} W</span></div>}
                        {c.controllo && <div className={styles.infoRow}><span className={styles.label}>Controllo:</span><span className={styles.value}>{c.controllo}</span></div>}
                        {c.brand && <div className={styles.infoRow}><span className={styles.label}>Marchio:</span><span className={styles.value}>{c.brand}</span></div>}
                        {c.free_radius_km && (<div className={styles.infoRow}><span className={styles.label}>Trasporto incluso entro:</span><span className={styles.value}>{c.free_radius_km} km</span></div>)}
                        {c.extra_cost_per_km && (<div className={styles.infoRow}><span className={styles.label}>Extra costo per km:</span><span className={styles.value}>{currency} {c.extra_cost_per_km}</span></div>)}
                      </>
                    )}
                    {c.type === "AUDIO" && (
                      <>
                        {c.brand && <div className={styles.infoRow}><span className={styles.label}>Marchio:</span><span className={styles.value}>{c.brand}</span></div>}
                        {c.power_kw && <div className={styles.infoRow}><span className={styles.label}>Potenza:</span><span className={styles.value}>{c.power_kw} W</span></div>}
                        {c.pax && <div className={styles.infoRow}><span className={styles.label}>Copertura:</span><span className={styles.value}>{c.pax} pax</span></div>}
                        {c.spl && <div className={styles.infoRow}><span className={styles.label}>SPL Max:</span><span className={styles.value}>{c.spl} dB</span></div>}
                        {c.tipologia && <div className={styles.infoRow}><span className={styles.label}>Tipologia:</span><span className={styles.value}>{c.tipologia}</span></div>}
                        {c.risposta && <div className={styles.infoRow}><span className={styles.label}>Risposta:</span><span className={styles.value}>{c.risposta}</span></div>}
                        {c.free_radius_km && (<div className={styles.infoRow}><span className={styles.label}>Trasporto incluso entro:</span><span className={styles.value}>{c.free_radius_km} km</span></div>)}
                        {c.extra_cost_per_km && (<div className={styles.infoRow}><span className={styles.label}>Extra costo per km:</span><span className={styles.value}>{currency} {c.extra_cost_per_km}</span></div>)}
                      </>
                    )}
                    {c.type === "ARTISTI" && (
                      <>
                        {c.genere && <div className={styles.infoRow}><span className={styles.label}>Genere:</span><span className={styles.value}>{c.genere}</span></div>}
                        {c.durata && <div className={styles.infoRow}><span className={styles.label}>Durata:</span><span className={styles.value}>{c.durata} h</span></div>}
                        {c.console !== undefined && <div className={styles.infoRow}><span className={styles.label}>Console inclusa:</span><span className={styles.value}>{c.console ? "Sì" : "No"}</span></div>}
                        {c.attrezzatura && <div className={styles.infoRow}><span className={styles.label}>Attrezzatura:</span><span className={styles.value}>{c.attrezzatura}</span></div>}
                        {c.free_radius_km && (<div className={styles.infoRow}><span className={styles.label}>Trasporto incluso entro:</span><span className={styles.value}>{c.free_radius_km} km</span></div>)}
                        {c.extra_cost_per_km && (<div className={styles.infoRow}><span className={styles.label}>Extra costo per km:</span><span className={styles.value}>{currency} {c.extra_cost_per_km}</span></div>)}
                      </>
                    )}
                    {c.type === "ALTRO" && (
                      <>
                        {c.tipologia && <div className={styles.infoRow}><span className={styles.label}>Tipologia:</span><span className={styles.value}>{c.tipologia}</span></div>}
                        {c.quantita && <div className={styles.infoRow}><span className={styles.label}>Quantità:</span><span className={styles.value}>{c.quantita}</span></div>}
                        {c.peso && <div className={styles.infoRow}><span className={styles.label}>Peso:</span><span className={styles.value}>{c.peso} kg</span></div>}
                        {c.materiale && <div className={styles.infoRow}><span className={styles.label}>Materiale:</span><span className={styles.value}>{c.materiale}</span></div>}
                        {c.brand && <div className={styles.infoRow}><span className={styles.label}>Marchio:</span><span className={styles.value}>{c.brand}</span></div>}
                        {c.free_radius_km && (<div className={styles.infoRow}><span className={styles.label}>Trasporto incluso entro:</span><span className={styles.value}>{c.free_radius_km} km</span></div>)}
                        {c.extra_cost_per_km && (<div className={styles.infoRow}><span className={styles.label}>Extra costo per km:</span><span className={styles.value}>{currency} {c.extra_cost_per_km}</span></div>)}
                      </>
                    )}

                    {c.type === "BUNDLE" && (
  <>
    {c.indoor && (<div className={styles.infoRow}><span className={styles.label}>Indoor:</span><span className={styles.value}>Sì</span></div>)}
    {c.outdoor && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Outdoor:</span>
        <span className={styles.value}>Sì</span>
      </div>
    )}
    {c.free_radius_km && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Trasporto incluso entro:</span>
        <span className={styles.value}>{c.free_radius_km} km</span>
      </div>
    )}
    {c.extra_cost_per_km && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Extra costo per km:</span>
        <span className={styles.value}>{currency} {c.extra_cost_per_km}</span>
      </div>
    )}
    {c.peso && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Peso:</span>
        <span className={styles.value}>{c.peso} kg</span>
      </div>
    )}
    {c.assorbimento && (
      <div className={styles.infoRow}>
        <span className={styles.label}>Assorbimento:</span>
        <span className={styles.value}>{c.assorbimento} W</span>
      </div>
    )}
  </>
)}


                  </div>

                  <div className={styles.descriptionColumn}>
                    <span className={styles.label}>Descrizione:</span>
                    <p>{c.description}</p>
                  </div>

                  <div className={styles.priceTagColumn}>
                    <div className={styles.categoryTagWrapper}>
                      <div className={`${styles.categoryTag} ${styles[`tag-${c.type}`]}`}>
                        {c.type}
                      </div>
                    </div>
                    <div className={styles.badgesUnder}>
                      {c.indoor && <span className={styles.badge}>Indoor</span>}
                      {c.outdoor && <span className={styles.badge}>Outdoor</span>}
                    </div>
                    <div className={styles.priceBox}>
                      <div className={styles.priceRow}>
                        {c.price_original && (
                          <div className={styles.originalPrice}>
                            {currency} {c.price_original}
                          </div>
                        )}
                        <div className={styles.discountedPrice}>
                          {currency} {c.price_1day}
                        </div>
                      </div>
                      <div className={styles.priceNote}>IVA inclusa</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={c.status === "active"}
                    onChange={() => toggleStatus(c.id, c.status)}
                  />
                  <span className={styles.slider}></span>
                </label>
                <span className={styles.statusLabel}>
                  {c.status === "active" ? "Disattiva" : "Attiva"}
                </span>
<div className={styles.cardActions}>
  <button
    className={styles.editBtn}
    onClick={() => {
      if (c.type === "BUNDLE") {
        setBundleData(c)
        setBundleImages(c.images || [])
        setBundlePreviewUrls(c.images || [])
        fetchBundleDetails(c.id) // carica i componenti inclusi
        setShowBundleForm(true)
      } else {
        setEditingComponent(c)
        setFormData(c)
        setShowForm(true)
      }
    }}
  >
    Modifica
  </button>

  <button
    className={styles.deleteBtn}
    onClick={() => handleDelete(c.id)}
  >
    Elimina
  </button>
</div>

              </div>
            </div>
          ))
        ) : (
          <p>Nessun componente trovato.</p>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={() => { setShowForm(false); setEditingComponent(null) }}>✕</button>
            <h2 className={styles.modalTitle}>
              {editingComponent ? "Modifica componente" : "Nuovo componente"}
            </h2>

            <div className={styles.categoryTabs}>
  {["LOCATION", "AUDIO", "LUCI", "PALCHI", "ARTISTI", "ALTRO"].map(cat => (

                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryTab} ${activeTab === cat ? styles.activeTab : ""}`}
                  onClick={() => { setActiveTab(cat); setFormData({ ...formData, type: cat }) }}
                >
                  {cat === "ARTISTI" ? "ARTISTI" : cat}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>

              {/* LOCATION */}
{activeTab === "LOCATION" && (
  <div className={styles.formGrid3}>
    <div className={styles.formColumn}>
      <label>Nome location</label>
      <input
        type="text"
        value={formData.name || ""}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <label>Indirizzo</label>
      <input
        type="text"
        value={formData.location_address || ""}
        onChange={(e) =>
          setFormData({ ...formData, location_address: e.target.value })
        }
      />
      <label>Città</label>
      <input
        type="text"
        value={formData.location_city || ""}
        onChange={(e) =>
          setFormData({ ...formData, location_city: e.target.value })
        }
      />
      


    </div>

    <div className={styles.formColumn}>
      <label>Capienza massima (persone)</label>
      <input
        type="number"
        value={formData.location_capacity || ""}
        onChange={(e) =>
          setFormData({ ...formData, location_capacity: e.target.value })
        }
      />
      <label>Superficie (m²)</label>
      <input
        type="number"
        value={formData.location_surface || ""}
        onChange={(e) =>
          setFormData({ ...formData, location_surface: e.target.value })
        }
      />
      <label>Servizi inclusi</label>
      <textarea
        className={styles.textareaStyled}
        placeholder="Parcheggio, WiFi, Catering..."
        value={formData.location_services || ""}
        onChange={(e) =>
          setFormData({ ...formData, location_services: e.target.value })
        }
      />
    </div>

    <div className={styles.formColumn}>
      <label>Regole / condizioni</label>
      <textarea
        className={styles.textareaStyled}
        placeholder="Orari, limiti rumore, restrizioni..."
        value={formData.location_rules || ""}
        onChange={(e) =>
          setFormData({ ...formData, location_rules: e.target.value })
        }
      />
        <label>Prezzo originale ({currency})</label>
  <input
    type="number"
    value={formData.price_original || ""}
    onChange={(e) => setFormData({ ...formData, price_original: e.target.value })}
  />
  <label>Prezzo scontato ({currency})</label>
  <input
    type="number"
    value={formData.price_1day || ""}
    onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })}
  />
    </div>
  </div>
)}

              {/* AUDIO */}
              {activeTab === "AUDIO" && (
                <div className={styles.formGrid3}>
                  <div className={styles.formColumn}>
                    <label>Nome componente</label>
                    <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <label>Marchio</label>
                    <input type="text" value={formData.brand || ""} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                    <label>Potenza RMS (W)</label>
                    <input type="number" value={formData.power_kw || ""} onChange={(e) => setFormData({ ...formData, power_kw: e.target.value })} />
                    <label>Copertura (PAX)</label>
                    <input type="number" value={formData.pax || ""} onChange={(e) => setFormData({ ...formData, pax: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>SPL Max (dB)</label>
                    <input type="number" value={formData.spl || ""} onChange={(e) => setFormData({ ...formData, spl: e.target.value })} />
                    <label>Tipologia</label>
                    <input type="text" value={formData.tipologia || ""} onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })} />
                    <label>Risposta in frequenza</label>
                    <input type="text" value={formData.risposta || ""} onChange={(e) => setFormData({ ...formData, risposta: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>Prezzo originale ({currency})</label>
                    <input type="number" value={formData.price_original || ""} onChange={(e) => setFormData({ ...formData, price_original: e.target.value })} />
                    <label>Prezzo scontato ({currency})</label>
                    <input type="number" value={formData.price_1day || ""} onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })} />
                    <label>Trasporto incluso entro (km)</label>
                    <input type="number" value={formData.free_radius_km || ""} onChange={(e) => setFormData({ ...formData, free_radius_km: e.target.value })} />
                    <label>Extra costo per km ({currency})</label>
                    <input type="number" value={formData.extra_cost_per_km || ""} onChange={(e) => setFormData({ ...formData, extra_cost_per_km: e.target.value })} />
                  </div>
                </div>
              )}

                            {/* LUCI */}
              {activeTab === "LUCI" && (
                <div className={styles.formGrid3}>
                  <div className={styles.formColumn}>
                    <label>Nome componente</label>
                    <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <label>Marchio</label>
                    <input type="text" value={formData.brand || ""} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}/>
                    <label>Tipologia</label>
                    <input type="text" value={formData.tipologia || ""} onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })} />
                    <label>Peso (kg)</label>
                    <input type="number" value={formData.peso || ""} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} />
                  </div>
                  

                  <div className={styles.formColumn}>
                    <label>Alimentazione</label>
                    <select value={formData.phase || ""} onChange={(e) => setFormData({ ...formData, phase: e.target.value })}>
                      <option value="">-- Seleziona --</option>
                      <option value="monofase">Monofase</option>
                      <option value="trifase">Trifase</option>
                    </select>
                    <label>Assorbimento (W)</label>
                    <input type="number" value={formData.assorbimento || ""} onChange={(e) => setFormData({ ...formData, assorbimento: e.target.value })} />
                    <label>Tipo di controllo</label>
                    <input type="text" value={formData.controllo || ""} onChange={(e) => setFormData({ ...formData, controllo: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>Prezzo originale ({currency})</label>
                    <input type="number" value={formData.price_original || ""} onChange={(e) => setFormData({ ...formData, price_original: e.target.value })} />
                    <label>Prezzo scontato ({currency})</label>
                    <input type="number" value={formData.price_1day || ""} onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })} />
                    <label>Trasporto incluso entro (km)</label>
                    <input type="number" value={formData.free_radius_km || ""} onChange={(e) => setFormData({ ...formData, free_radius_km: e.target.value })} />
                    <label>Extra costo per km ({currency})</label>
                    <input type="number" value={formData.extra_cost_per_km || ""} onChange={(e) => setFormData({ ...formData, extra_cost_per_km: e.target.value })} />
                  </div>
                </div>
              )}

              {/* PALCHI */}
              {activeTab === "PALCHI" && (
                <div className={styles.formGrid3}>
                  <div className={styles.formColumn}>
                    <label>Nome componente</label>
                    <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <label>Lunghezza (m)</label>
                    <input type="number" value={formData.lunghezza || ""} onChange={(e) => setFormData({ ...formData, lunghezza: e.target.value })} />
                    <label>Larghezza (m)</label>
                    <input type="number" value={formData.larghezza || ""} onChange={(e) => setFormData({ ...formData, larghezza: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>Altezza (m)</label>
                    <input type="number" value={formData.altezza || ""} onChange={(e) => setFormData({ ...formData, altezza: e.target.value })} />
                    <label>Peso (kg)</label>
                    <input type="number" value={formData.peso || ""} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} />
                    <label>Marchio</label>
                    <input type="text" value={formData.brand || ""} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>Prezzo originale ({currency})</label>
                    <input type="number" value={formData.price_original || ""} onChange={(e) => setFormData({ ...formData, price_original: e.target.value })} />
                    <label>Prezzo scontato ({currency})</label>
                    <input type="number" value={formData.price_1day || ""} onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })} />
                    <label>Trasporto incluso entro (km)</label>
                    <input type="number" value={formData.free_radius_km || ""} onChange={(e) => setFormData({ ...formData, free_radius_km: e.target.value })} />
                    <label>Extra costo per km ({currency})</label>
                    <input type="number" value={formData.extra_cost_per_km || ""} onChange={(e) => setFormData({ ...formData, extra_cost_per_km: e.target.value })} />
                  </div>
                </div>
              )}





              {/* Artisti */}
             {activeTab === "ARTISTI" && (
  <div className={styles.formGrid3}>
    <div className={styles.formColumn}>
      <label>Nome artista</label>
      <input
        type="text"
        value={formData.name || ""}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <label>Genere musicale</label>
      <input
        type="text"
        value={formData.genere || ""}
        onChange={(e) => setFormData({ ...formData, genere: e.target.value })}
      />
      <label>Durata performance (h)</label>
      <input
        type="number"
        value={formData.durata || ""}
        onChange={(e) => setFormData({ ...formData, durata: e.target.value })}
      />
    </div>

    <div className={styles.formColumn}>
      <label>Attrezzatura richiesta</label>
      <textarea
        className={styles.textareaStyled}
        value={formData.attrezzatura || ""}
        onChange={(e) => setFormData({ ...formData, attrezzatura: e.target.value })}
      />
       {/* Console inclusa (spostata in fondo) */}
    <div className={styles.formColumn} style={{ gridColumn: "1 / span 3" }}>
      <label>Console inclusa</label>
      <div className={styles.radioGroup}>
        <label>
          <input
            type="radio"
            name="console"
            checked={formData.console === true}
            onChange={() => setFormData({ ...formData, console: true })}
          />
          Sì
        </label>
        <label>
          <input
            type="radio"
            name="console"
            checked={formData.console === false}
            onChange={() => setFormData({ ...formData, console: false })}
          />
          No
        </label>
      </div>

      {formData.console === true && (
        <>
          <label>Console utilizzata</label>
          <input
            type="text"
            value={formData.console_modello || ""}
            onChange={(e) => setFormData({ ...formData, console_modello: e.target.value })}
          />
        </>
      )}
    </div>
    </div>

    <div className={styles.formColumn}>
      <label>Prezzo originale ({currency})</label>
<input
  type="number"
  value={formData.price_original || ""}
  onChange={(e) => setFormData({ ...formData, price_original: e.target.value })}
/>
<label>Prezzo scontato ({currency})</label>
<input
  type="number"
  value={formData.price_1day || ""}
  onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })}
/>

      <label>Costo entro (km)</label>
      <input
        type="number"
        value={formData.free_radius_km || ""}
        onChange={(e) => setFormData({ ...formData, free_radius_km: e.target.value })}
      />
      <label>Extra costo per km ({currency})</label>
      <input
        type="number"
        value={formData.extra_cost_per_km || ""}
        onChange={(e) => setFormData({ ...formData, extra_cost_per_km: e.target.value })}
      />
    </div>

   
  </div>
)}


              {/* ALTRO */}
              {activeTab === "ALTRO" && (
                <div className={styles.formGrid3}>
                  <div className={styles.formColumn}>
                    <label>Nome componente</label>
                    <input type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <label>Tipologia</label>
                    <input type="text" value={formData.tipologia || ""} onChange={(e) => setFormData({ ...formData, tipologia: e.target.value })} />
                    <label>Quantità</label>
                    <input type="number" value={formData.quantita || ""} onChange={(e) => setFormData({ ...formData, quantita: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>Peso (kg)</label>
                    <input type="number" value={formData.peso || ""} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} />
                    <label>Materiale</label>
                    <input type="text" value={formData.materiale || ""} onChange={(e) => setFormData({ ...formData, materiale: e.target.value })} />
                    <label>Marchio</label>
                    <input type="text" value={formData.brand || ""} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                  </div>
                  <div className={styles.formColumn}>
                    <label>Prezzo originale ({currency})</label>
                    <input type="number" value={formData.price_original || ""} onChange={(e) => setFormData({ ...formData, price_original: e.target.value })} />
                    <label>Prezzo scontato ({currency})</label>
                    <input type="number" value={formData.price_1day || ""} onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })} />
                    <label>Trasporto incluso entro (km)</label>
                    <input type="number" value={formData.free_radius_km || ""} onChange={(e) => setFormData({ ...formData, free_radius_km: e.target.value })} />
                    <label>Extra costo per km ({currency})</label>
                    <input type="number" value={formData.extra_cost_per_km || ""} onChange={(e) => setFormData({ ...formData, extra_cost_per_km: e.target.value })} />
                  </div>
                </div>
              )}

              <label>Descrizione</label>
              <textarea
                className={styles.textareaStyled}
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />

              <div className={styles.checkboxRow}>
                <label>
                  <input type="checkbox" checked={formData.indoor || false} onChange={(e) => setFormData({ ...formData, indoor: e.target.checked })} />
                  Indoor
                </label>
                <label>
                  <input type="checkbox" checked={formData.outdoor || false} onChange={(e) => setFormData({ ...formData, outdoor: e.target.checked })} />
                  Outdoor
                </label>
              </div>

<label htmlFor="fileUpload" className={styles.uploadBtn}>
  Carica immagini
</label>
<input
  id="fileUpload"
  type="file"
  multiple
  accept="image/*"
  style={{ display: "none" }}
  onChange={(e) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)))
  }}
/>



              {previewUrls.length > 0 && (
                <div className={styles.preview}>
                  {previewUrls.map((src, i) => (
                    <div key={i} className={styles.previewImgWrapper}>
                      <img src={src} alt="preview" className={styles.previewImg} />
                      <button type="button" className={styles.removeImgBtn} onClick={() => removeImage(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.modalButtonWrapper}>
                <button type="submit">
                  {editingComponent ? "Aggiorna componente" : "Salva componente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREA BUNDLE */}
      {showBundleForm && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      {/* Chiudi modal */}
      <button
        className={styles.closeBtn}
        onClick={() => setShowBundleForm(false)}
      >
        ✕
      </button>
      <h2 className={styles.modalTitle}>
  {bundleData.id ? "Modifica Bundle" : "Crea nuovo Bundle"}
</h2>

      {/* Input iniziali in 3 colonne */}
      <div className={styles.bundleGrid3}>
        {/* Colonna 1 */}
        <div className={styles.formColumn}>
          <label>Nome bundle</label>
          <input
            type="text"
            value={bundleData.name || ""}
            onChange={(e) =>
              setBundleData({ ...bundleData, name: e.target.value })
            }
          />

<label className={styles.checkLabel}>
  <input
    type="checkbox"
    checked={bundleData.indoor || false}
    onChange={(e) => setBundleData({ ...bundleData, indoor: e.target.checked })}
  />
  <span className={styles.customCheck}></span>
  Indoor
</label>


<label className={styles.checkLabel}>
  <input
    type="checkbox"
    checked={bundleData.outdoor || false}
    onChange={(e) =>
      setBundleData({ ...bundleData, outdoor: e.target.checked })
    }
  />
  <span className={styles.customCheck}></span>
  Outdoor
</label>

        </div>

        {/* Colonna 2 */}
        <div className={styles.formColumn}>
          <label>Trasporto incluso entro (km)</label>
          <input
            type="number"
            value={bundleData.free_radius_km || ""}
            onChange={(e) =>
              setBundleData({ ...bundleData, free_radius_km: e.target.value })
            }
          />

          <label>Extra costo per km (€)</label>
          <input
            type="number"
            value={bundleData.extra_cost_per_km || ""}
            onChange={(e) =>
              setBundleData({ ...bundleData, extra_cost_per_km: e.target.value })
            }
          />
        </div>

        {/* Colonna 3 */}
        <div className={styles.formColumn}>
          <label>Peso (kg)</label>
          <input
            type="number"
            value={bundleData.peso || ""}
            onChange={(e) =>
              setBundleData({ ...bundleData, peso: e.target.value })
            }
          />

          <label>Assorbimento (W)</label>
          <input
            type="number"
            value={bundleData.assorbimento || ""}
            onChange={(e) =>
              setBundleData({ ...bundleData, assorbimento: e.target.value })
            }
          />
        </div>
      </div>

      {/* Search componenti */}
      <div className={styles.bundleSearch}>
        <input
          type="text"
          placeholder="Cerca componenti..."
          value={searchBundle}
          onChange={(e) => setSearchBundle(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Corpo con due colonne */}
      <div className={styles.bundleBody}>
        {/* Colonna componenti disponibili */}
        <div className={styles.bundleAvailable}>
          <div className={styles.bundleGrid}>
            {components
              .filter(
                (c) =>
                  c.type !== "BUNDLE" &&
                  c.name.toLowerCase().includes(searchBundle.toLowerCase())
              )
              .map((c) => (
                <div key={c.id} className={styles.bundleCard}>
                  {c.images?.[0] && (
                    <img
                      src={c.images[0]}
                      alt={c.name}
                      className={styles.bundleImg}
                    />
                  )}
                  <div style={{ flex: 1, marginLeft: "0.8rem" }}>
                    <h4>{c.name}</h4>
                    <p>
                      <span
                        className={`${styles.categoryTag} ${styles[`tag-${c.type}`]}`}
                      >
                        {c.type}
                      </span>
                    </p>
                    <p>
                      {currency} {c.price_1day}
                    </p>
                  </div>
<label className={styles.checkLabel}>
  <input
    type="checkbox"
    checked={selectedComponents.some((sc) => sc.id === c.id)}
    onChange={() => toggleComponentInBundle(c)}
  />
  <span className={styles.customCheck}></span>
  Aggiungi
</label>

                </div>
              ))}
          </div>
        </div>

        {/* Colonna selezionati sempre visibile */}
        <div className={styles.bundleSelected}>
          <h4>Componenti selezionati</h4>
          {selectedComponents.length === 0 ? (
            <p>Nessun componente selezionato</p>
          ) : (
            <ul className={styles.selectedListUl}>
              {selectedComponents.map((sc) => (
                <li key={sc.id} className={styles.selectedListItem}>
                  {sc.name} - {currency} {sc.price_1day}
                  <button
                    type="button"
                    onClick={() => removeFromBundle(sc.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Descrizione */}
      <div className={styles.bundleForm}>
        <label>Descrizione bundle</label>
        <textarea
          className={styles.textareaStyled}
          value={bundleData.description || ""}
          onChange={(e) =>
            setBundleData({ ...bundleData, description: e.target.value })
          }
          rows={4}
        />
      </div>

      {/* Totali e prezzi bundle */}
      <div className={styles.bundleTotals}>
        <p>Totale originale: {currency} {totalOriginal}</p>
        <p>Totale scontato: {currency} {totalDiscounted}</p>

        <label>Prezzo originale bundle</label>
        <input
          type="number"
          value={bundleData.price_original || ""}
          onChange={(e) =>
            setBundleData({ ...bundleData, price_original: e.target.value })
          }
        />

        <label>Prezzo scontato bundle</label>
        <input
          type="number"
          value={bundleData.price_1day || ""}
          onChange={(e) =>
            setBundleData({ ...bundleData, price_1day: e.target.value })
          }
        />
      </div>

      {/* Upload immagini */}
      <label htmlFor="bundleUpload" className={styles.uploadBtn}>
        Carica immagini
      </label>
      <input
        id="bundleUpload"
        type="file"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (!e.target.files) return
          const files = Array.from(e.target.files).slice(0, 5)
          setBundleImages(files)
          setBundlePreviewUrls(
            files.map((file) => URL.createObjectURL(file))
          )
        }}
      />

      {bundlePreviewUrls.length > 0 && (
        <div className={styles.preview}>
          {bundlePreviewUrls.map((src, i) => (
            <div key={i} className={styles.previewImgWrapper}>
              <img src={src} alt="preview" className={styles.previewImg} />
              <button
                type="button"
                className={styles.removeImgBtn}
                onClick={() => removeBundleImage(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Salva */}
<div className={styles.modalButtonWrapper}>
  <button className={styles.bundleBtn} onClick={handleSaveBundle}>
    {bundleData.id ? "Aggiorna Bundle" : "Crea Bundle"}
  </button>
</div>
    </div>
  </div>
      )}











    </div>



  )
}

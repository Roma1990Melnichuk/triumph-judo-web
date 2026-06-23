'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { ShoppingBag, Plus, Trash2, Package } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProductDoc {
  id: string
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
  quantity: number
  imageUrl?: string
}

const CATEGORIES = ['Кімоно', 'Пояси', 'Захист', 'Взуття', 'Аксесуари', 'Інше']

export default function ShopPage() {
  const { userModel } = useAuth()
  const isCoach = userModel?.role === 'coach'
  const [products, setProducts] = useState<ProductDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState<string>('all')
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'Кімоно', inStock: true, quantity: '1',
  })

  useEffect(() => {
    const q = query(collection(db, 'shop_products'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          name: (data.name as string) ?? '',
          description: (data.description as string) ?? '',
          price: (data.price as number) ?? 0,
          category: (data.category as string) ?? 'Інше',
          inStock: (data.inStock as boolean) ?? true,
          quantity: (data.quantity as number) ?? 0,
          imageUrl: data.imageUrl as string | undefined,
        }
      }))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'shop_products'), {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price) || 0,
        category: form.category,
        inStock: form.inStock,
        quantity: parseInt(form.quantity) || 0,
        createdAt: serverTimestamp(),
      })
      toast.success('Товар додано')
      setShowAdd(false)
      setForm({ name: '', description: '', price: '', category: 'Кімоно', inStock: true, quantity: '1' })
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'shop_products', id))
      toast.success('Видалено')
    } catch {
      toast.error('Помилка')
    }
  }

  const displayed = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Магазин</h1>
          <p className="text-sm text-[#746E68]">{products.length} товарів</p>
        </div>
        {isCoach && <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Додати</Button>}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...CATEGORIES]).map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filterCat === cat ? 'bg-[#D50000] text-white' : 'bg-[#1B0A08] text-[#B7B0A8] hover:bg-[#2A1410]'}`}>
            {cat === 'all' ? 'Всі' : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-[#120605] animate-pulse" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="p-10 text-center">
          <ShoppingBag size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Товарів поки немає</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {displayed.map(product => (
            <div key={product.id} className="rounded-2xl bg-[#120605] border border-[#2A1410] overflow-hidden">
              {/* Image placeholder */}
              <div className="h-32 bg-[#1B0A08] flex items-center justify-center">
                <Package size={32} className="text-[#2A1410]" />
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className="text-sm font-semibold text-[#F7F5F2] leading-tight flex-1">{product.name}</p>
                  {isCoach && (
                    <button onClick={() => handleDelete(product.id)} className="p-0.5 text-[#746E68] hover:text-[#FF3B30] transition-colors shrink-0">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#746E68] mb-2 line-clamp-2">{product.description || product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FFD21A]">{product.price} грн</span>
                  <Badge variant={product.inStock ? 'success' : 'error'} className="text-[10px]">
                    {product.inStock ? `${product.quantity} шт` : 'Немає'}
                  </Badge>
                </div>
                {!isCoach && (
                  <button
                    onClick={() => toast('Зверніться до тренера для замовлення', { icon: '🛍️' })}
                    className="w-full mt-2 h-8 rounded-xl bg-[#D50000]/10 text-[#D50000] text-xs font-semibold hover:bg-[#D50000]/20 transition-colors"
                  >
                    Замовити
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} title="Новий товар">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input label="Назва" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Кімоно Judo..." />
          <Input label="Опис" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Коротко про товар..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ціна (грн)" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" />
            <Input label="Кількість" type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} min="0" />
          </div>
          <Select label="Категорія" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} className="w-4 h-4 rounded accent-[#D50000]" />
            <span className="text-sm text-[#B7B0A8]">В наявності</span>
          </label>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Скасувати</Button>
            <Button type="submit" loading={saving}>Додати</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

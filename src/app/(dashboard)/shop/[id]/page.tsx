'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { addToCart, useCart } from '@/lib/hooks/useShop'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Flame, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Variant {
  id: string
  size?: string
  color?: string
  stockQuantity: number
  priceModifier: number
}

interface ProductDoc {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrls?: string[]
  imageUrl?: string
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  isInStock: boolean
  coachNote?: string
  variants: Variant[]
  createdAt: Date
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params as unknown as Promise<{ id: string }>)
  const { userModel } = useAuth()
  const router = useRouter()

  const [product, setProduct] = useState<ProductDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const { cart, itemCount } = useCart(userModel?.uid)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'shop_products', id), (snap) => {
      if (snap.exists()) {
        const d = snap.data() as Record<string, unknown>
        const p: ProductDoc = {
          id: snap.id,
          name: (d.name as string) ?? '',
          description: (d.description as string) ?? '',
          price: (d.price as number) ?? 0,
          category: (d.category as string) ?? '',
          imageUrls: (d.imageUrls as string[]) ?? [],
          imageUrl: d.imageUrl as string | undefined,
          isActive: (d.isActive as boolean) ?? true,
          isFeatured: (d.isFeatured as boolean) ?? false,
          isNew: (d.isNew as boolean) ?? false,
          isInStock: (d.isInStock as boolean) ?? true,
          coachNote: d.coachNote as string | undefined,
          variants: (d.variants as Variant[]) ?? [],
          createdAt: (d.createdAt as Timestamp)?.toDate() ?? new Date(),
        }
        setProduct(p)
        if (p.variants.length > 0) {
          setSelectedVariant(p.variants[0])
        }
      } else {
        setProduct(null)
      }
      setLoading(false)
    })
    return unsub
  }, [id])

  const imageUrl =
    product?.imageUrls?.[0] ?? product?.imageUrl ?? null

  const uniqueSizes = product?.variants
    ? [...new Set(product.variants.filter((v) => v.size).map((v) => v.size!))]
    : []

  const uniqueColors = product?.variants
    ? [...new Set(product.variants.filter((v) => v.color).map((v) => v.color!))]
    : []

  const effectivePrice =
    (product?.price ?? 0) + (selectedVariant?.priceModifier ?? 0)

  const handleSelectSize = (size: string) => {
    const match = product?.variants.find(
      (v) =>
        v.size === size &&
        (selectedVariant?.color ? v.color === selectedVariant.color : true)
    )
    setSelectedVariant(match ?? product?.variants.find((v) => v.size === size) ?? null)
  }

  const handleSelectColor = (color: string) => {
    const match = product?.variants.find(
      (v) =>
        v.color === color &&
        (selectedVariant?.size ? v.size === selectedVariant.size : true)
    )
    setSelectedVariant(match ?? product?.variants.find((v) => v.color === color) ?? null)
  }

  const handleAddToCart = async () => {
    if (!userModel?.uid || !product) return
    setAdding(true)
    try {
      const variantId = selectedVariant?.id ?? '__default__'
      await addToCart(userModel.uid, {
        productId: product.id,
        variantId,
        quantity,
        priceSnapshot: effectivePrice,
        title: product.name,
        imageUrl: imageUrl ?? '',
        size: selectedVariant?.size,
        color: selectedVariant?.color,
      })
      toast.success('Додано до кошика')
    } catch {
      toast.error('Помилка. Спробуйте ще раз.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="h-8 w-32 rounded-xl bg-[#1A120F] animate-pulse" />
        <div className="h-72 rounded-2xl bg-[#1A120F] animate-pulse" />
        <div className="space-y-3">
          <div className="h-7 w-3/4 rounded-xl bg-[#1A120F] animate-pulse" />
          <div className="h-5 w-1/3 rounded-xl bg-[#1A120F] animate-pulse" />
          <div className="h-16 rounded-xl bg-[#1A120F] animate-pulse" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-5 max-w-2xl">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-[#9A9692] hover:text-[#F5F5F5] transition-colors"
        >
          <ArrowLeft size={16} />
          До магазину
        </Link>
        <div className="tr-card p-10 text-center space-y-3">
          <Package size={40} className="mx-auto text-[#34201A]" />
          <p className="text-[#9A9692]">Товар не знайдено</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Back link */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-[#9A9692] hover:text-[#F5F5F5] transition-colors"
      >
        <ArrowLeft size={16} />
        До магазину
      </Link>

      {/* Product image */}
      <div className="tr-card overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-[#1A120F] flex flex-col items-center justify-center gap-3">
            <Package size={56} className="text-[#34201A]" />
            <span className="text-xs text-[#9A9692]">{product.category}</span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="space-y-4">
        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          {product.isNew && <Badge variant="success">Новинка</Badge>}
          {product.isFeatured && <Badge variant="gold">Рекомендовано</Badge>}
          {!product.isInStock && <Badge variant="error">Немає в наявності</Badge>}
        </div>

        {/* Name & price */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl text-[#F5F5F5] leading-tight">{product.name}</h1>
          <span className="font-display text-2xl text-[#FFC400] shrink-0">
            {effectivePrice.toLocaleString('uk-UA')} грн
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-[#9A9692] leading-relaxed">{product.description}</p>
        )}

        {/* Coach note */}
        {product.coachNote && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[#1A120F] border border-[#34201A]">
            <Flame size={15} className="text-[#FF6A00] mt-0.5 shrink-0" />
            <p className="text-sm italic text-[#9A9692]">{product.coachNote}</p>
          </div>
        )}

        {/* Size selector */}
        {uniqueSizes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#9A9692] uppercase tracking-wider">Розмір</p>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const isActive = selectedVariant?.size === size
                return (
                  <button
                    key={size}
                    onClick={() => handleSelectSize(size)}
                    className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'tr-btn-brand text-white'
                        : 'bg-[#1A120F] border border-[#34201A] text-[#9A9692] hover:border-[#E30613] hover:text-[#F5F5F5]'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Color selector */}
        {uniqueColors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#9A9692] uppercase tracking-wider">Колір</p>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((color) => {
                const isActive = selectedVariant?.color === color
                return (
                  <button
                    key={color}
                    onClick={() => handleSelectColor(color)}
                    className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'tr-btn-brand text-white'
                        : 'bg-[#1A120F] border border-[#34201A] text-[#9A9692] hover:border-[#E30613] hover:text-[#F5F5F5]'
                    }`}
                  >
                    {color}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quantity stepper */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#9A9692] uppercase tracking-wider">Кількість</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-xl bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] flex items-center justify-center hover:border-[#E30613] transition-colors"
              aria-label="Зменшити кількість"
            >
              <Minus size={14} />
            </button>
            <span className="font-display text-lg text-[#F5F5F5] w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-xl bg-[#1A120F] border border-[#34201A] text-[#F5F5F5] flex items-center justify-center hover:border-[#E30613] transition-colors"
              aria-label="Збільшити кількість"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Add to cart + cart link */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.isInStock || adding}
            className="tr-btn-brand h-12 px-5 rounded-[16px] text-white font-bold flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {adding ? (
              <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={16} />
            )}
            {!product.isInStock ? 'Немає в наявності' : 'Додати в кошик'}
          </button>

          {itemCount > 0 && (
            <Link
              href="/shop/cart"
              className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[#FFC400] hover:text-[#FF6A00] transition-colors"
            >
              До кошика
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E30613] text-white text-[10px] font-bold">
                {itemCount}
              </span>
              →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

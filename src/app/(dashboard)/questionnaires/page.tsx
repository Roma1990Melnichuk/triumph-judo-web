'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { ClipboardList, Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface QuestionnaireDoc {
  id: string
  title: string
  questions: Array<{ id: string; text: string; type: string }>
  coachId: string
  createdAt: Date
  isActive: boolean
}

export default function QuestionnairesPage() {
  const { userModel } = useAuth()
  if (userModel?.role !== 'coach') return <p className="text-[#746E68]">Тільки для тренерів</p>

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<string[]>([''])

  useEffect(() => {
    if (!userModel?.uid) return
    const q = query(collection(db, 'questionnaires'), where('coachId', '==', userModel.uid))
    const unsub = onSnapshot(q, (snap) => {
      setQuestionnaires(snap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id: d.id,
          title: (data.title as string) ?? '',
          questions: (data.questions as QuestionnaireDoc['questions']) ?? [],
          coachId: (data.coachId as string) ?? '',
          createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
          isActive: (data.isActive as boolean) ?? true,
        }
      }))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [userModel?.uid])

  const addQuestion = () => {
    if (questions.length < 5) setQuestions(q => [...q, ''])
  }

  const removeQuestion = (idx: number) => {
    setQuestions(q => q.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx: number, val: string) => {
    setQuestions(q => q.map((item, i) => i === idx ? val : item))
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const validQuestions = questions.filter(q => q.trim())
    if (validQuestions.length === 0) { toast.error('Додайте хоча б одне питання'); return }
    setSaving(true)
    try {
      await addDoc(collection(db, 'questionnaires'), {
        title: title.trim(),
        questions: validQuestions.map((text, i) => ({ id: `q${i}`, text, type: 'text' })),
        coachId: userModel!.uid,
        createdAt: serverTimestamp(),
        isActive: true,
      })
      toast.success('Анкету створено')
      setShowAdd(false)
      setTitle('')
      setQuestions([''])
    } catch {
      toast.error('Помилка')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'questionnaires', id), { isActive: !current })
      toast.success(current ? 'Деактивовано' : 'Активовано')
    } catch {
      toast.error('Помилка')
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#F7F5F2]">Анкети</h1>
          <p className="text-sm text-[#746E68]">{questionnaires.length} анкет</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" />Створити</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-[#120605] animate-pulse" />)}</div>
      ) : questionnaires.length === 0 ? (
        <div className="p-10 text-center">
          <ClipboardList size={32} className="mx-auto mb-3 text-[#746E68]" />
          <p className="text-sm text-[#746E68]">Анкет поки немає</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questionnaires.map(q => (
            <div key={q.id} className="p-4 rounded-2xl bg-[#120605] border border-[#2A1410]">
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-[#D50000]/10 flex items-center justify-center shrink-0">
                  <ClipboardList size={15} className="text-[#D50000]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[#F7F5F2]">{q.title}</p>
                    <Badge variant={q.isActive ? 'success' : 'default'} className="text-[10px]">
                      {q.isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#746E68]">{q.questions.length} питань · {formatDate(q.createdAt)}</p>
                  <div className="mt-2 space-y-1">
                    {q.questions.slice(0, 3).map((question, i) => (
                      <p key={i} className="text-xs text-[#B7B0A8] truncate">{i + 1}. {question.text}</p>
                    ))}
                    {q.questions.length > 3 && (
                      <p className="text-xs text-[#746E68]">+{q.questions.length - 3} ще...</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(q.id, q.isActive)}
                  className={`p-1.5 rounded-lg transition-colors ${q.isActive ? 'text-[#63D728] bg-[#63D728]/10' : 'text-[#746E68] bg-[#1B0A08] hover:text-[#63D728]'}`}
                >
                  {q.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onClose={() => { setShowAdd(false); setTitle(''); setQuestions(['']) }} title="Нова анкета">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Назва анкети" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Опитування після змагань..." />
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#B7B0A8]">Питання ({questions.length}/5)</p>
              {questions.length < 5 && (
                <button type="button" onClick={addQuestion} className="text-xs text-[#D50000] hover:text-[#FF3B30] font-semibold">+ Додати питання</button>
              )}
            </div>
            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={q}
                    onChange={e => updateQuestion(idx, e.target.value)}
                    placeholder={`Питання ${idx + 1}...`}
                    className="flex-1 h-9 px-3 rounded-xl bg-[#1B0A08] border border-[#2A1410] text-sm text-[#F7F5F2] placeholder-[#746E68] focus:outline-none focus:border-[#FFD21A]"
                  />
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(idx)} className="p-1.5 text-[#746E68] hover:text-[#FF3B30] transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" type="button" onClick={() => { setShowAdd(false); setTitle(''); setQuestions(['']) }}>Скасувати</Button>
            <Button type="submit" loading={saving}>Створити</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}

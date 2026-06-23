// ── User ──────────────────────────────────────────────────────────────────────
export interface UserModel {
  uid: string
  email: string
  name: string
  role: 'coach' | 'parent'
  phone?: string
  photoUrl?: string
  childId?: string
  childIds: string[]
  clubId?: string
  individualPrice: number
  paymentCards: PaymentCard[]
}

export interface PaymentCard {
  type: 'monobank' | 'privat' | 'other'
  number: string
  holder: string
}

// ── Child / Athlete ───────────────────────────────────────────────────────────
export type Gender = 'male' | 'female'

export interface ChildModel {
  id: string
  firstName: string
  lastName: string
  birthYear: number
  weightCategory: string
  currentBelt: BeltLevel
  photoUrl?: string
  coachId: string
  coachName: string
  totalPoints: number
  createdAt: Date
  clubId?: string
  gender?: Gender
  beltReady: boolean
  bonusPoints: number
  phone?: string
}

// ── Belt ──────────────────────────────────────────────────────────────────────
export type BeltLevel =
  | 'white' | 'whiteYellow' | 'yellow' | 'yellowOrange'
  | 'orange' | 'orangeGreen' | 'green' | 'greenBlue'
  | 'blue' | 'blueBrown' | 'brown' | 'black'

export type ExerciseCategory = 'technique' | 'physical' | 'theory' | 'competition'

export interface Exercise {
  id: string
  name: string
  description: string
  category: ExerciseCategory
  videoUrl?: string
}

export interface BeltRequirementModel {
  belt: BeltLevel
  exercises: Exercise[]
  updatedAt: Date
  updatedByCoachId: string
}

export interface BeltProgressModel {
  childId: string
  belt: BeltLevel
  passed: Record<string, boolean>
  updatedAt: Date
  updatedByCoachId: string
}

// ── Group / Schedule ──────────────────────────────────────────────────────────
export interface GroupModel {
  id: string
  coachId: string
  name: string
  childIds: string[]
  daysOfWeek: number[]  // 1=Mon..7=Sun
  timeStart: string     // "18:00"
  timeEnd: string       // "19:30"
}

export interface AttendanceModel {
  id: string
  childId: string
  groupId: string
  date: Date
  present: boolean
  coachId: string
}

// ── Achievements ──────────────────────────────────────────────────────────────
export type AchievementCategory =
  | 'belts' | 'tournaments' | 'training' | 'discipline'
  | 'behavior' | 'technique' | 'theory' | 'special' | 'seasonal'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type AchievementType = 'auto' | 'manual' | 'both'

export interface AchievementDef {
  id: string
  name: string
  description: string
  emoji: string
  category: AchievementCategory
  rarity: AchievementRarity
  type: AchievementType
  isHidden?: boolean
}

export interface AchievementModel {
  childId: string
  achievementId: string
  earnedAt: Date
  grantedByCoachId?: string
  note?: string
}

// ── Nutrition ─────────────────────────────────────────────────────────────────
export type MealType = 'breakfast' | 'snack' | 'lunch' | 'supper' | 'dinner'
export type MealStatus = 'done' | 'skipped' | 'pending'

export interface MealModel {
  id: string
  childId: string
  type: MealType
  date: Date
  photoUrl?: string
  mealName: string
  hasProtein: boolean
  hasVegetables: boolean
  hasCarbs: boolean
  hasFruits: boolean
  hadWater: boolean
  calories?: number
  comment: string
  status: MealStatus
  createdAt: Date
}

export interface WaterLogModel {
  id: string
  childId: string
  amountMl: number
  loggedAt: Date
}

export interface NutritionTip {
  id: string
  childId: string
  date: Date
  tip: string
  coachId: string
}

// ── Competition ───────────────────────────────────────────────────────────────
export type MedalType = 'gold' | 'silver' | 'bronze' | 'none'

export interface CompetitionResult {
  id: string
  childId: string
  competitionName: string
  date: Date
  place: number
  medal: MedalType
  weight: string
  points: number
  coachId: string
  notes?: string
}

export interface CompetitionType {
  id: string
  name: string
  level: 'city' | 'regional' | 'national' | 'international'
  points: Record<string, number>
}

// ── Fitness ───────────────────────────────────────────────────────────────────
export interface FitnessExercise {
  id: string
  name: string
  description: string
  muscleGroup: string
  videoUrl?: string
}

export interface FitnessAssignment {
  id: string
  childId: string
  coachId: string
  exercises: AssignedExercise[]
  assignedAt: Date
  dueDate?: Date
  title: string
  notes?: string
}

export interface AssignedExercise {
  exerciseId: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  completed: boolean
}

export interface FitnessLog {
  id: string
  childId: string
  assignmentId: string
  completedAt: Date
  exercises: AssignedExercise[]
}

export interface FitnessGoal {
  id: string
  childId: string
  metric: string
  target: number
  current: number
  unit: string
  dueDate?: Date
  createdAt: Date
}

export interface BodyMeasurement {
  id: string
  childId: string
  date: Date
  weight?: number
  height?: number
  bmi?: number
}

// ── Events ────────────────────────────────────────────────────────────────────
export interface EventModel {
  id: string
  title: string
  description: string
  date: Date
  endDate?: Date
  location?: string
  type: 'competition' | 'training' | 'seminar' | 'other'
  coachId: string
  imageUrl?: string
}

// ── News / Posts ──────────────────────────────────────────────────────────────
export interface ClubPost {
  id: string
  title: string
  content: string
  imageUrl?: string
  videoUrl?: string
  authorId: string
  authorName: string
  createdAt: Date
  isPinned: boolean
  isVisible: boolean
  likes: number
}

// ── Membership ────────────────────────────────────────────────────────────────
export type MembershipStatus = 'active' | 'expired' | 'pending' | 'cancelled'

export interface MembershipModel {
  id: string
  childId: string
  parentId: string
  tariffId: string
  tariffName: string
  startDate: Date
  endDate: Date
  status: MembershipStatus
  amountPaid: number
  paidAt?: Date
  notes?: string
}

export interface Tariff {
  id: string
  name: string
  price: number
  duration: number // days
  description: string
  isActive: boolean
}

// ── Shop ──────────────────────────────────────────────────────────────────────
export interface ShopProduct {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  inStock: boolean
  quantity: number
}

export interface ShopOrder {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: Date
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface NotificationModel {
  id: string
  userId: string
  title: string
  body: string
  type: 'belt' | 'achievement' | 'event' | 'membership' | 'general'
  read: boolean
  createdAt: Date
  data?: Record<string, string>
}

// ── Questionnaire ─────────────────────────────────────────────────────────────
export interface Questionnaire {
  id: string
  title: string
  questions: Question[]
  coachId: string
  createdAt: Date
  isActive: boolean
}

export interface Question {
  id: string
  text: string
  type: 'text' | 'scale' | 'choice'
  options?: string[]
}

export interface QuestionnaireResponse {
  id: string
  questionnaireId: string
  childId: string
  answers: Record<string, string | number>
  submittedAt: Date
}

// ── Individual Training ───────────────────────────────────────────────────────
export interface IndividualSlot {
  id: string
  coachId: string
  childId?: string
  date: Date
  timeStart: string
  timeEnd: string
  price: number
  status: 'available' | 'booked' | 'completed' | 'cancelled'
  notes?: string
}

// ── Rating ────────────────────────────────────────────────────────────────────
export interface HonorBoardEntry {
  id: string
  childId: string
  childName: string
  achievement: string
  date: Date
  coachId: string
}

// ── Training Session ──────────────────────────────────────────────────────────
export interface TrainingSession {
  id: string
  groupId: string
  coachId: string
  date: Date
  attendees: string[]
  absentees: string[]
  notes?: string
}

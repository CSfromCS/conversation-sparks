import { Copy, Check } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { toast } from 'sonner'

interface Question {
  text: string
  difficulty: 'icebreaker' | 'intermediate' | 'deep' | 'connection'
}

interface QuestionCardProps {
  question: Question
  index: number
}

const difficultyColors = {
  icebreaker: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  deep: 'bg-purple-100 text-purple-700 border-purple-200',
  connection: 'bg-amber-100 text-amber-700 border-amber-200'
}

const difficultyLabels = {
  icebreaker: 'Icebreaker',
  intermediate: 'Intermediate',
  deep: 'Deep',
  connection: 'Connection'
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(question.text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Badge className={difficultyColors[question.difficulty]} variant="outline">
              {difficultyLabels[question.difficulty]}
            </Badge>
            <p className="text-lg leading-relaxed">{question.text}</p>
          </div>
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="text-primary" weight="bold" />
            ) : (
              <Copy />
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

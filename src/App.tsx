import { useState } from 'react'
import { Chats, Sparkle, ArrowClockwise } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionCard } from '@/components/QuestionCard'
import { Toaster, toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

const spark = window.spark

interface Question {
  text: string
  difficulty: 'icebreaker' | 'intermediate' | 'deep'
}

interface SocialContext {
  groupSize: string
  ageRange: string
  vibe: string
  interests: string
  closeness: string
}

function App() {
  const [context, setContext] = useState<SocialContext>({
    groupSize: '',
    ageRange: '',
    vibe: '',
    interests: '',
    closeness: ''
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const generateQuestions = async () => {
    if (!context.groupSize && !context.ageRange && !context.vibe && !context.interests && !context.closeness) {
      toast.error('Please provide at least some context about your group')
      return
    }

    setIsLoading(true)
    
    try {
      const prompt = spark.llmPrompt`You are a thoughtful conversation facilitator. Generate exactly 10 conversation questions based on the following social context:

Group Size: ${context.groupSize || 'not specified'}
Age Range: ${context.ageRange || 'not specified'}
Vibe: ${context.vibe || 'casual'}
Interests: ${context.interests || 'general'}
Closeness Level: ${context.closeness || 'acquaintances'}

Generate questions with varying difficulty levels:
- 2 icebreaker questions (light, easy, fun)
- 5 intermediate questions (more engaging, thoughtful)
- 3 deep questions (philosophical, introspective, meaningful, requires relationship history to answer, connection)

Make sure questions are:
1. Contextually appropriate for the group
2. Open-ended and encourage discussion
3. Respectful and inclusive
4. Interesting and thought-provoking

Return the result as a valid JSON object with a single property called "questions" that contains an array of question objects. Each question object should have "text" (the question) and "difficulty" (one of: "icebreaker", "intermediate", "deep").

Format: 
{
"questions": [
{"text": "question text here", "difficulty": "icebreaker"},
...more questions
]
}`

      const response = await spark.llm(prompt, 'gpt-4o', true)
      const parsed = JSON.parse(response)
      
      if (parsed.questions && Array.isArray(parsed.questions)) {
        setQuestions(parsed.questions)
        toast.success('Questions generated!')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate questions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Chats className="text-primary" size={40} weight="duotone" />
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Conversation Sparks
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Asking the right questions to spark actually meaningful conversations.
          </p>
        </header>

        <Card className="p-6 md:p-8 space-y-3">
          <div>
            <h2 className="text-2xl font-medium mb-2">Who's playing? 😊</h2>
            <p className="text-sm text-muted-foreground">
              Tell us about your group. Feel free to leave some empty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group-size">Group Size</Label>
              <Select value={context.groupSize} onValueChange={(value) => setContext({ ...context, groupSize: value })}>
                <SelectTrigger id="group-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-3">2-3 people</SelectItem>
                  <SelectItem value="4-6">4-6 people</SelectItem>
                  <SelectItem value="7-10">7-10 people</SelectItem>
                  <SelectItem value="10+">10+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age-range">Age Range</Label>
              <Select value={context.ageRange} onValueChange={(value) => setContext({ ...context, ageRange: value })}>
                <SelectTrigger id="age-range">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teens">Teens (13-19)</SelectItem>
                  <SelectItem value="young-adults">Young Adults (20-29)</SelectItem>
                  <SelectItem value="adults">Adults (30-49)</SelectItem>
                  <SelectItem value="mature">Mature (50+)</SelectItem>
                  <SelectItem value="mixed">Mixed Ages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closeness">Closeness Level</Label>
              <Select value={context.closeness} onValueChange={(value) => setContext({ ...context, closeness: value })}>
                <SelectTrigger id="closeness">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strangers">Just Met / Strangers</SelectItem>
                  <SelectItem value="acquaintances">Acquaintances</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="close-friends">Close Friends</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="officemates">Officemates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vibe">Current Vibe</Label>
              <Input
                id="vibe"
                placeholder="e.g., relaxed, energetic, formal"
                value={context.vibe}
                onChange={(e) => setContext({ ...context, vibe: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Shared Interests</Label>
            <Textarea
              id="interests"
              placeholder="e.g., sports, movies, technology, travel..."
              value={context.interests}
              onChange={(e) => setContext({ ...context, interests: e.target.value })}
              rows={3}
            />
          </div>

          <Button
            onClick={generateQuestions}
            disabled={isLoading}
            className="w-full md:w-auto"
            size="lg"
          >
            {isLoading ? (
              <>Generating...</>
            ) : (
              <>
                <Sparkle className="mr-2" weight="fill" />
                Generate Questions
              </>
            )}
          </Button>
        </Card>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-medium">Your Questions</h2>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </Card>
              ))}
            </motion.div>
          )}

          {!isLoading && questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium">Your Questions</h2>
                <Button
                  onClick={generateQuestions}
                  variant="outline"
                  size="sm"
                >
                  <ArrowClockwise className="mr-2" />
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionCard
                    key={index}
                    question={question}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <footer className="text-center text-sm text-muted-foreground">
          <a
            href="https://www.linkedin.com/in/csfromcs/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            CS by CS
          </a>
        </footer>
      </div>
    </div>
  )
}

export default App
import { useState, useEffect } from 'react'
import { Chats, Sparkle, ShootingStar, ArrowClockwise, CopySimple, Check } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator} from '@/components/ui/select'
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
  difficulty: 'icebreaker' | 'intermediate' | 'deep' | 'connection'
}

interface SocialContext {
  groupSize: string
  ageRange: string
  vibe: string
  interests: string
  closeness: string
}

function getContextFromURL(): SocialContext {
  const params = new URLSearchParams(window.location.search)
  return {
    groupSize: params.get('groupSize') || '',
    ageRange: params.get('ageRange') || '',
    vibe: params.get('vibe') || '',
    interests: params.get('interests') || '',
    closeness: params.get('closeness') || ''
  }
}

function updateURL(context: SocialContext) {
  const params = new URLSearchParams()
  if (context.groupSize) params.set('groupSize', context.groupSize)
  if (context.ageRange) params.set('ageRange', context.ageRange)
  if (context.vibe) params.set('vibe', context.vibe)
  if (context.interests) params.set('interests', context.interests)
  if (context.closeness) params.set('closeness', context.closeness)
  
  const newURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
  window.history.replaceState({}, '', newURL)
}

function App() {
  const [context, setContext] = useState<SocialContext>(getContextFromURL)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  useEffect(() => {
    updateURL(context)
  }, [context])

  const generateQuestions = async (makeUnique = false) => {
    if (!context.groupSize && !context.ageRange && !context.vibe && !context.interests && !context.closeness) {
      toast.error('Please provide at least some context about your group')
      return
    }

    setIsLoading(true)
    
    try {
      const existingQuestions = makeUnique ? questions.map(q => q.text).join('\n- ') : ''
      
      const uniqueInstructions = makeUnique ? `
IMPORTANT: The following questions have already been generated. You MUST avoid these topics and create entirely NEW and MORE UNIQUE questions:
- ${existingQuestions}

Be creative and unconventional. Explore different angles, unusual perspectives, and unexpected topics that still fit the social context. Think outside the box while maintaining appropriateness.` : ''

      const prompt = spark.llmPrompt`You are a thoughtful conversation facilitator. Generate exactly 8 conversation questions based on the following social context:

Group Size: ${context.groupSize || 'not specified'}
Age Range: ${context.ageRange || 'not specified'}
Vibe: ${context.vibe || 'casual'}
Interests: ${context.interests || 'general'}
Closeness Level: ${context.closeness || 'acquaintances'}
${uniqueInstructions}

Generate questions with varying difficulty levels:
- 2 icebreaker questions (light, easy, fun)
- 3 intermediate questions (more engaging, thoughtful)
- 2 deep questions (philosophical or introspective questions that explore values, beliefs, or meaningful life experiences. These should invite reflection.)
- 1 connection question (reflects on their relationship or what they've learned about each other. This should provide closure and potentially an action item or takeaway.)

Make sure questions are:
1. Contextually appropriate for the group
2. Open-ended and encourage discussion
3. Respectful and inclusive
4. Interesting and thought-provoking

Return the result as a valid JSON object with a single property called "questions" that contains an array of question objects. Each question object should have "text" (the question) and "difficulty" (one of: "icebreaker", "intermediate", "deep", "connection").

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
        toast.success(makeUnique ? 'More unique questions generated!' : 'Questions generated!')
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

  const copyAllToClipboard = async () => {
    const icebreakers = questions.filter(q => q.difficulty === 'icebreaker')
    const intermediate = questions.filter(q => q.difficulty === 'intermediate')
    const deep = questions.filter(q => q.difficulty === 'deep')
    const connection = questions.filter(q => q.difficulty === 'connection')

    const contextSummary = [
      context.groupSize && `Group Size: ${context.groupSize}`,
      context.ageRange && `Age Range: ${context.ageRange}`,
      context.closeness && `Closeness: ${context.closeness}`,
      context.vibe && `Vibe: ${context.vibe}`,
      context.interests && `Interests: ${context.interests}`
    ].filter(Boolean).join('\n')

    const formatQuestions = (questions: Question[], title: string) => {
      if (questions.length === 0) return ''
      if(questions.length === 1) return `\n${title}\n${questions[0].text}`
      return `\n${title}\n${questions.map((q, i) => `${i + 1}. ${q.text}`).join('\n')}`
    }

    const formattedText = `🌟 Conversation Sparks 🌟 
${contextSummary}
${formatQuestions(icebreakers, '🧊 Icebreakers')}
${formatQuestions(intermediate, '💭 Intermediate')}
${formatQuestions(deep, '🔮 Deep')}
${formatQuestions(connection, '🤝 Connection')}

from https://conversation-spark--csfromcs.github.app/`

    try {
      await navigator.clipboard.writeText(formattedText)
      setCopiedAll(true)
      toast.success('All questions copied to clipboard!')
      setTimeout(() => setCopiedAll(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Chats className="text-accent" size={40} weight="duotone" />
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              Conversation Sparks
            </h1>
            <Chats className="text-accent" size={40} weight="duotone" />
          </div>
          <p className="text-lg text-muted-foreground">
            Asking the right questions to spark actually meaningful conversations.
          </p>
        </header>

        <Card className="p-6 md:p-8 space-y-3">
          <div>
            <h2 className="text-2xl font-medium mb-2">Who's playing?</h2>
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
                  <SelectSeparator />
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="officemates">Officemates</SelectItem>
                  <SelectItem value="mentorship">Mentorship</SelectItem>
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
            onClick={() => generateQuestions(false)}
            disabled={isLoading}
            className="w-full md:w-auto"
            size="lg"
          >
            {isLoading ? (
              <>Generating...</>
            ) : (
              <>
                <ShootingStar className="mr-0" weight="fill" />
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
                <div className="flex gap-1">
                  <Button
                    onClick={copyAllToClipboard}
                    variant="default"
                    size="sm"
                  >
                    {copiedAll ? (
                      <>
                        <Check className="mr-2" weight="bold" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <CopySimple className="mr-2" />
                        Copy All
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => generateQuestions(true)}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowClockwise className="mr-2" />
                    More Unique!
                  </Button>
                </div>
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
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Trophy, Clock, AlertCircle, CheckCircle2, XCircle, Filter } from 'lucide-react'
import { ChallengeService } from '@/lib/services/challengeService'
import { UnifiedChallenge } from '@/lib/services/challengeService'
import { useToast } from '@/components/ui/use-toast'

export function UserChallenges() {
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<UnifiedChallenge[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'created'>('all')

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true)
      try {
        const fetchedChallenges = await ChallengeService.getChallenges()
        // Filter challenges related to the current user
        // In a real app, you would filter by user ID from auth context
        setChallenges(fetchedChallenges)
      } catch (error) {
        console.error("Error loading challenges:", error);
        toast({ title: 'Error', description: 'Failed to load challenges', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    fetchChallenges()
  }, [toast])

  // Filter challenges based on the active tab
  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return challenge.status === 'active'
    if (activeTab === 'completed') return challenge.status === 'completed' || challenge.status === 'approved'
    if (activeTab === 'created') return challenge.createdBy === 'currentUser' // Assuming a createdBy field
    return true
  })

  // Get challenge type badge
  const getChallengeBadge = (type: string) => {
    if (type === 'social') {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Social</Badge>
    } else if (type === 'trading') {
      return <Badge className="bg-green-500 hover:bg-green-600">Trading</Badge>
    }
    return null
  }

  // Get challenge status badge
  const getChallengeStatusBadge = (challenge: UnifiedChallenge) => {
    if (challenge.status === 'completed' || challenge.status === 'approved') {
      return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
    } else if (challenge.status === 'rejected') {
      return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>
    } else if (challenge.status === 'pending') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Approval</Badge>
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Calculate days remaining
  const getDaysRemaining = (expiresAt: string) => {
    const today = new Date()
    const expireDate = new Date(expiresAt)
    const diffTime = expireDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Submit proof for a challenge
  const handleSubmitProof = async (challengeId: string) => {
    // In a real app, this would open a dialog to upload proof
    toast({
      title: 'Submit Proof',
      description: 'This would open a dialog to submit proof for the challenge',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">My Challenges</CardTitle>
        <CardDescription>
          View and manage your challenges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Challenges</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="created">Created by Me</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredChallenges.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No challenges found</AlertTitle>
                <AlertDescription>
                  {activeTab === 'all' 
                    ? "You don't have any challenges yet." 
                    : activeTab === 'active' 
                      ? "You don't have any active challenges."
                      : activeTab === 'completed'
                        ? "You haven't completed any challenges yet."
                        : "You haven't created any challenges yet."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{challenge.title}</h3>
                            {getChallengeBadge(challenge.type)}
                            {getChallengeStatusBadge(challenge)}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{challenge.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                              <span>{challenge.reward} points</span>
                            </div>
                            {challenge.expiresAt && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                                <span>
                                  {getDaysRemaining(challenge.expiresAt) > 0 
                                    ? `${getDaysRemaining(challenge.expiresAt)} days left` 
                                    : 'Expired'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {challenge.difficulty && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500">Difficulty: {challenge.difficulty}</span>
                              </div>
                              <Progress 
                                value={challenge.difficulty === 'easy' ? 33 : challenge.difficulty === 'medium' ? 66 : 100} 
                                className="h-1.5" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-gray-500">
                          {challenge.createdAt && `Created: ${formatDate(challenge.createdAt)}`}
                        </div>
                        <div className="flex gap-2">
                          {challenge.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleSubmitProof(challenge.id)}
                            >
                              Submit Proof
                            </Button>
                          )}
                          {challenge.createdBy === 'currentUser' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

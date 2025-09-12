'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChallengeService, UnifiedChallenge, ChallengeSubmission, ChallengeDifficulty } from '@/lib/services/challengeService'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Users, 
  Trophy, 
  Calendar, 
  Star, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

// Using interfaces from challengeService.ts

export function ChallengeManagement() {
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<UnifiedChallenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<UnifiedChallenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<UnifiedChallenge | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'social' | 'trading'>('all')
  const [newChallenge, setNewChallenge] = useState<Partial<UnifiedChallenge>>({
    title: '',
    description: '',
    reward: 50,
    difficulty: 'medium',
    category: 'Performance',
    proofRequired: true,
    status: 'active',
    type: 'social'
  })

  // Fetch challenges from challenge service
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true)
      try {
        // Get both social and trading challenges
        const fetchedChallenges = await ChallengeService.getChallenges()
        setChallenges(fetchedChallenges)
      } catch (error) {
        console.error('Error fetching challenges:', error)
        toast({
          title: 'Error',
          description: 'Failed to load challenges',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchChallenges()
  }, [toast])
  
  // Filter challenges based on type filter
  useEffect(() => {
    if (typeFilter === 'all') {
      setFilteredChallenges(challenges)
    } else {
      setFilteredChallenges(challenges.filter(challenge => challenge.type === typeFilter))
    }
  }, [challenges, typeFilter])

  const handleCreateChallenge = async () => {
    if (!newChallenge.title || !newChallenge.description) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Create a new challenge using the service
      const challenge = await ChallengeService.createChallenge({
        title: newChallenge.title || '',
        description: newChallenge.description || '',
        reward: newChallenge.reward || 50,
        difficulty: newChallenge.difficulty || 'medium',
        category: newChallenge.category || 'Performance',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        proofRequired: newChallenge.proofRequired !== false,
        status: 'active',
        type: 'social',
        submissions: [],
        createdBy: 'Broker Admin',
        rules: [newChallenge.description || '']
      })
    
      // Add to local state
      setChallenges((prev: UnifiedChallenge[]) => [challenge, ...prev])
      
      // Reset form and close dialog
      setNewChallenge({
        title: '',
        description: '',
        reward: 50,
        difficulty: 'medium',
        category: 'Performance',
        proofRequired: true,
        type: 'social'
      })
      setShowCreateDialog(false)
      
      toast({
        title: 'Challenge Created',
        description: 'The challenge has been created successfully',
      })
    } catch (error) {
      console.error('Error creating challenge:', error)
      toast({
        title: 'Error',
        description: 'Failed to create challenge',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveSubmission = async (challengeId: string, submissionId: string): Promise<void> => {
    try {
      await ChallengeService.updateSubmissionStatus(challengeId, submissionId, 'approved')
      
      // Update local state
      setChallenges((prev: UnifiedChallenge[]) => 
        prev.map((challenge: UnifiedChallenge) => {
          if (challenge.id === challengeId && challenge.type === 'social' && challenge.submissions) {
            return {
              ...challenge,
              submissions: challenge.submissions.map((sub: ChallengeSubmission) => {
                if (sub.id === submissionId) {
                  return {
                    ...sub,
                    status: 'approved'
                  }
                }
                return sub
              })
            }
          }
          return challenge
        })
      )
      
      toast({
        title: 'Submission Approved',
        description: 'The challenge submission has been approved',
      })
    } catch (error) {
      console.error('Error approving submission:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve submission',
        variant: 'destructive'
      })
    }
  }

  const handleRejectSubmission = async (challengeId: string, submissionId: string): Promise<void> => {
    try {
      await ChallengeService.updateSubmissionStatus(challengeId, submissionId, 'rejected')
      
      // Update local state
      setChallenges((prev: UnifiedChallenge[]) => 
        prev.map((challenge: UnifiedChallenge) => {
          if (challenge.id === challengeId && challenge.type === 'social' && challenge.submissions) {
            return {
              ...challenge,
              submissions: challenge.submissions.map((sub: ChallengeSubmission) => {
                if (sub.id === submissionId) {
                  return {
                    ...sub,
                    status: 'rejected'
                  }
                }
                return sub
              })
            }
          }
          return challenge
        })
      )
      
      toast({
        title: 'Submission Rejected',
        description: 'The challenge submission has been rejected',
      })
    } catch (error) {
      console.error('Error rejecting submission:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject submission',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'investor-bg-success investor-success'
      case 'medium': return 'investor-bg-warning investor-warning'
      case 'hard': return 'investor-bg-warning investor-warning'
      case 'extreme': return 'investor-bg-danger investor-danger'
      default: return 'investor-bg-info investor-info'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'status-bg-active status-active'
      case 'completed': return 'investor-bg-info investor-info'
      case 'expired': return 'status-bg-expired status-expired'
      default: return 'status-bg-pending status-pending'
    }
  }

  const getPendingSubmissionsCount = (challenge: UnifiedChallenge) => {
    if (challenge.type !== 'social' || !challenge.submissions) return 0;
    return challenge.submissions.filter(sub => sub.status === 'pending').length;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Challenge Management</h2>
          <p className="text-sm text-muted-foreground">Manage all challenges across the platform</p>
        </div>
        <div className="flex items-center gap-4">
          <Select 
            value={typeFilter} 
            onValueChange={(value) => setTypeFilter(value as 'all' | 'social' | 'trading')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Challenges</SelectItem>
              <SelectItem value="social">Social Challenges</SelectItem>
              <SelectItem value="trading">Trading Challenges</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateDialog(true)}>
            Create Challenge
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Challenge Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Prize</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Submissions</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChallenges.map((challenge) => (
              <TableRow key={challenge.id} className="group">
                <TableCell>
                  <div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {challenge.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {challenge.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/5 border-primary/20">
                    {challenge.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4 investor-success" />
                    {typeof challenge.reward === 'number' ? challenge.reward : challenge.reward}
                  </div>
                  <Badge className={`mt-1 ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{challenge.participants}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Created: {formatDate(challenge.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Expires: {formatDate(challenge.expiresAt)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(challenge.status)}>
                    {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {challenge.type === 'social' && challenge.submissions ? (
                    challenge.submissions.length > 0 ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedChallenge(challenge)
                          setShowSubmissionsDialog(true)
                        }}
                      >
                        <Badge className="bg-primary text-primary-foreground mr-1">
                          {getPendingSubmissionsCount(challenge)}
                        </Badge>
                        View
                      </Button>
                    ) : (
                      <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                        No submissions
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      {challenge.type === 'trading' ? 'Trading' : 'Other'}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedChallenge(challenge)
                          // Edit functionality would go here
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // Sync to social feed functionality would go here
                          toast({
                            title: 'Challenge Synced',
                            description: 'Challenge has been synced to the social feed',
                          })
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Sync to Social Feed
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={async () => {
                          try {
                            await ChallengeService.deleteChallenge(challenge.id)
                            setChallenges((prev: UnifiedChallenge[]) => prev.filter((c: UnifiedChallenge) => c.id !== challenge.id))
                            toast({
                              title: 'Challenge Deleted',
                              description: 'The challenge has been deleted',
                            })
                          } catch (error) {
                            console.error('Error deleting challenge:', error)
                            toast({
                              title: 'Error',
                              description: 'Failed to delete challenge',
                              variant: 'destructive'
                            })
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredChallenges.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {typeFilter === 'all' ? 'No challenges found' : 
                   typeFilter === 'social' ? 'No social challenges found' : 
                   'No trading challenges found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    {/* Create Challenge Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Challenge</DialogTitle>
          <DialogDescription>
            Create a new challenge for users to complete on the platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Challenge Title</Label>
            <Input 
              id="title" 
              value={newChallenge.title || ''} 
              onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
              placeholder="Enter an engaging challenge title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={newChallenge.description || ''} 
              onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
              placeholder="Describe what users need to do to complete the challenge"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={newChallenge.difficulty} 
                onValueChange={(value) => setNewChallenge({...newChallenge, difficulty: value as ChallengeDifficulty})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="extreme">Extreme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reward">Prize Amount</Label>
              <Input
                id="reward"
                type="number"
                value={typeof newChallenge.reward === 'number' ? newChallenge.reward : 50}
                onChange={(e) => setNewChallenge({...newChallenge, reward: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Challenge Type</Label>
              <Select 
                value={newChallenge.type} 
                onValueChange={(value) => setNewChallenge({...newChallenge, type: value as 'social' | 'trading'})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newChallenge.category}
                onChange={(e) => setNewChallenge({...newChallenge, category: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="proofRequired" 
              checked={newChallenge.proofRequired !== false}
              onCheckedChange={(checked) => setNewChallenge({...newChallenge, proofRequired: checked})}
            />
            <Label htmlFor="proofRequired">Require proof of completion</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateChallenge} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* View Submissions Dialog */}
    <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Challenge Submissions</DialogTitle>
          <DialogDescription>
            Review and manage submissions for {selectedChallenge?.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {selectedChallenge?.type === 'social' && selectedChallenge?.submissions?.map((submission) => (
            <Card key={submission.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {submission.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{submission.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        Submitted {formatDate(submission.submittedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {submission.proofContent}
                  </div>
                  
                  {submission.proofMedia && (
                    <div className="mt-2">
                       <img 
                        src={submission.proofMedia} 
                        alt="Proof" 
                        className="rounded-md max-h-[200px] object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {submission.status === 'pending' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleApproveSubmission(selectedChallenge.id, submission.id)}
                      >
                        <CheckCircle className="h-4 w-4 investor-success" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleRejectSubmission(selectedChallenge.id, submission.id)}
                      >
                        <XCircle className="h-4 w-4 investor-danger" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Badge className={submission.status === 'approved' ? 
                      'investor-bg-success investor-success' : 
                      'investor-bg-danger investor-danger'}
                    >
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          {selectedChallenge?.type === 'social' && (!selectedChallenge.submissions || selectedChallenge.submissions.length === 0) && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No submissions for this challenge yet</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </div>
  )
}

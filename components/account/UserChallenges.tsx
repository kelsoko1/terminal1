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
import { useToast } from '@/components/ui/use-toast'

// Define a local challenge type
interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  category: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  updatedAt: string;
  participants: number;
  createdById: string;
}

export function UserChallenges() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'created'>('all');

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/challenges');
        if (!response.ok) throw new Error('Failed to fetch challenges');
        const fetchedChallenges = await response.json();
        // Filter challenges related to the current user
        // In a real app, you would filter by user ID from auth context
        setChallenges(fetchedChallenges);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load challenges', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenges();
  }, [toast]);

  // Filter challenges based on the active tab
  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return challenge.status === 'active';
    if (activeTab === 'completed') return challenge.status === 'completed';
    if (activeTab === 'created') return challenge.createdById === 'currentUserId'; // Replace 'currentUserId' with actual user ID
    return true;
  });

  // Get challenge type badge
  const getChallengeBadge = (category: string) => {
    if (category === 'social') {
      return <Badge className="investor-bg-info investor-info">Social</Badge>;
    } else if (category === 'trading') {
      return <Badge className="investor-bg-success investor-success">Trading</Badge>;
    }
    return null;
  };

  // Get challenge status badge
  const getChallengeStatusBadge = (challenge: Challenge) => {
    if (challenge.status === 'completed') {
      return <Badge className="investor-bg-success investor-success">Completed</Badge>;
    } else if (challenge.status === 'expired') {
      return <Badge className="investor-bg-danger investor-danger">Expired</Badge>;
    } else {
      return <Badge className="investor-bg-info investor-info">Active</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate days remaining
  const getDaysRemaining = (expiresAt: string) => {
    const today = new Date();
    const expireDate = new Date(expiresAt);
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Submit proof for a challenge
  const handleSubmitProof = async (challengeId: string) => {
    // In a real app, this would open a dialog to upload proof
    toast({
      title: 'Submit Proof',
      description: 'This would open a dialog to submit proof for the challenge',
    });
  };

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
                <div className="animate-spin rounded-full h-8 w-8 border-border"></div>
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
                            {getChallengeBadge(challenge.category)}
                            {getChallengeStatusBadge(challenge)}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{challenge.description}</p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-1 investor-warning" />
                              <span>{challenge.reward} points</span>
                            </div>
                            {challenge.updatedAt && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 investor-info" />
                                <span>
                                  {getDaysRemaining(challenge.updatedAt) > 0
                                    ? `${getDaysRemaining(challenge.updatedAt)} days left`
                                    : 'Expired'}
                                </span>
                              </div>
                            )}
                          </div>

                          {challenge.difficulty && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Difficulty: {challenge.difficulty}</span>
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
                        <div className="text-xs text-muted-foreground">
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
                          {challenge.createdById === 'currentUserId' && ( // Replace 'currentUserId' with actual user ID
                            <Button
                              size="sm"
                              variant="outline"
                              className="investor-danger border-red-200 hover:investor-bg-danger hover:investor-danger"
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
  );
}

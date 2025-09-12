import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Image,
  BarChart2,
  TrendingUp,
  DollarSign,
  Hash,
  AtSign,
  Globe,
  Users,
  Lock,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ShareTradeIdeaProps {
  onShare: (post: any) => void;
}

export function ShareTradeIdea({ onShare }: ShareTradeIdeaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL' | null>(null);
  const [price, setPrice] = useState('');
  const [analysisType, setAnalysisType] = useState<'Technical' | 'Fundamental' | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>(['DSE']);
  const [mentions, setMentions] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [mentionInput, setMentionInput] = useState('');
  const [includePosition, setIncludePosition] = useState(false);
  const [includeAnalysis, setIncludeAnalysis] = useState(false);

  const handleAddHashtag = (tag: string) => {
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  };

  const handleAddMention = (mention: string) => {
    if (mention && !mentions.includes(mention)) {
      setMentions([...mentions, mention]);
      setMentionInput('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleRemoveMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));
  };

  const handleShare = () => {
    const post = {
      text: postText,
      hashtags,
      mentions,
      visibility,
      attachments,
      ...(includePosition && tradeType && selectedSymbol && price && {
        trade: {
          type: tradeType,
          symbol: selectedSymbol,
          price: parseFloat(price),
        },
      }),
      ...(includeAnalysis && analysisType && analysisSummary && {
        analysis: {
          type: analysisType,
          summary: analysisSummary,
        },
      }),
    };

    onShare(post);
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setPostText('');
    setSelectedSymbol('');
    setTradeType(null);
    setPrice('');
    setAnalysisType(null);
    setAnalysisSummary('');
    setHashtags(['DSE']);
    setMentions([]);
    setAttachments([]);
    setIncludePosition(false);
    setIncludeAnalysis(false);
  };

  const isValidPost = () => {
    if (!postText.trim()) return false;
    if (includePosition && (!tradeType || !selectedSymbol || !price)) return false;
    if (includeAnalysis && (!analysisType || !analysisSummary.trim())) return false;
    return true;
  };

  const getCharacterCount = () => {
    return postText.length;
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'followers': return <Users className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Share Trade Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between dark:text-white">
            <span>Share Trade Idea</span>
            <div className="flex items-center space-x-2">
              <Select value={visibility} onValueChange={(value: 'public' | 'followers' | 'private') => setVisibility(value)}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    {getVisibilityIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Everyone</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                  <SelectItem value="private">Only me</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Textarea
            placeholder="What's your trading insight?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="min-h-[120px] dark:bg-gray-800 dark:text-gray-100"
          />

          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="flex items-center gap-1 dark:bg-gray-800"
              >
                #{tag}
                <button 
                  onClick={() => handleRemoveHashtag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
            {mentions.map((mention) => (
              <Badge 
                key={mention} 
                variant="secondary"
                className="flex items-center gap-1 dark:bg-gray-800"
              >
                @{mention}
                <button 
                  onClick={() => handleRemoveMention(mention)}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Add hashtag"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag(hashtagInput)}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <AtSign className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Mention someone"
                  value={mentionInput}
                  onChange={(e) => setMentionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMention(mentionInput)}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={includePosition}
                onCheckedChange={setIncludePosition}
                id="include-position"
              />
              <Label htmlFor="include-position">Include Position Details</Label>
            </div>

            {includePosition && (
              <div className="grid grid-cols-3 gap-4">
                <Select value={tradeType || ''} onValueChange={(value: 'BUY' | 'SELL') => setTradeType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Symbol"
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />

                <Input
                  placeholder="Price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={includeAnalysis}
                onCheckedChange={setIncludeAnalysis}
                id="include-analysis"
              />
              <Label htmlFor="include-analysis">Include Analysis</Label>
            </div>

            {includeAnalysis && (
              <div className="space-y-4">
                <Select value={analysisType || ''} onValueChange={(value: 'Technical' | 'Fundamental') => setAnalysisType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Analysis Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Fundamental">Fundamental</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Analysis summary..."
                  value={analysisSummary}
                  onChange={(e) => setAnalysisSummary(e.target.value)}
                  className="min-h-[80px] dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="dark:text-gray-400 dark:hover:text-gray-300">
                      <Image className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {getCharacterCount()}/280
              </span>
            </div>
            <Button 
              onClick={handleShare}
              disabled={!isValidPost()}
            >
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
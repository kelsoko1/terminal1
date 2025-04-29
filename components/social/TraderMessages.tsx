import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Sarah Kimaro',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkimaro',
    content: 'What are your thoughts on the recent CRDB earnings report?',
    timestamp: '2h ago',
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: 'The numbers look strong. Their digital banking initiatives are paying off.',
    timestamp: '2h ago',
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'Sarah Kimaro',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarahkimaro',
    content: 'Agreed! Do you think it\'s a good entry point at current levels?',
    timestamp: '1h ago',
  },
  {
    id: '4',
    senderId: '1',
    senderName: 'You',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
    content: 'Yes, the P/E ratio is attractive and they have a solid dividend yield.',
    timestamp: '1h ago',
  },
];

export function TraderMessages() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.senderName === 'You' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
              </Avatar>
              <div
                className={`flex-1 ${
                  message.senderName === 'You' ? 'text-right' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.senderName}</span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>
                <div
                  className={`inline-block rounded-lg px-4 py-2 ${
                    message.senderName === 'You'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
} 
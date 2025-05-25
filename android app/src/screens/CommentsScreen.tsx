import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/CustomThemeProvider';
import { backendService } from '../services/backendService';
import { Send } from 'lucide-react-native';
import Icon from '../components/Icon';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
}

interface CommentsScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export default function CommentsScreen({ route, navigation }: CommentsScreenProps) {
  const { postId } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [post, setPost] = useState<any>(null);
  const { theme } = useTheme();

  // Fetch comments for the post
  const fetchComments = useCallback(async () => {
    try {
      const response = await backendService.getPostComments(postId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Fetch post details
  const fetchPost = useCallback(async () => {
    try {
      const response = await backendService.getPost(postId);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
    fetchPost();
  }, [fetchComments, fetchPost]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await backendService.addComment(postId, { content: newComment.trim() });
      
      // Clear input and refresh comments
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={[styles.commentContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.commentHeader}>
          <View style={styles.authorContainer}>
            {item.author.image ? (
              <Image source={{ uri: item.author.image }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {item.author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={[styles.authorName, { color: theme.colors.text }]}>
                {item.author.name}
              </Text>
              <Text style={[styles.commentDate, { color: theme.colors.text + '80' }]}>
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.commentContent, { color: theme.colors.text }]}>
          {item.content}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Comments</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading comments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Comments</Text>
          <View style={styles.headerRight} />
        </View>

        {post && (
          <View style={[styles.postPreview, { backgroundColor: theme.colors.card }]}>
            <View style={styles.authorContainer}>
              {post.author?.image ? (
                <Image source={{ uri: post.author.image }} style={styles.avatarSmall} />
              ) : (
                <View style={[styles.avatarPlaceholderSmall, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.avatarTextSmall}>
                    {post.author?.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <Text style={[styles.postAuthor, { color: theme.colors.text }]}>
                {post.author?.name || 'Unknown'}
              </Text>
            </View>
            <Text 
              style={[styles.postContent, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {post.content}
            </Text>
          </View>
        )}

        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No comments yet. Be the first to comment!
              </Text>
            </View>
          }
        />

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.colors.text + '80'}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            editable={!submitting}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: submitting || !newComment.trim() ? 0.6 : 1,
              },
            ]}
            onPress={handleAddComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icon icon={Send} size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 60, // Balance the header
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  postPreview: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  avatarPlaceholderSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarTextSmall: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  commentContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

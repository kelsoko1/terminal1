import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/CustomThemeProvider';
import { backendService } from '../services/backendService';
import { MessageSquare, Heart, Share2, Send, Image as ImageIcon, X } from 'lucide-react-native';
import Icon from '../components/Icon';
import * as ImagePicker from 'expo-image-picker';

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  likes: number;
  comments: number;
  liked: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'link';
    url: string;
  }>;
}

interface SocialFeedScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

export default function SocialFeedScreen({ navigation }: SocialFeedScreenProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();

  // Fetch posts from the backend
  const fetchPosts = useCallback(async () => {
    try {
      const response = await backendService.getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleLikePost = async (postId: string) => {
    try {
      await backendService.likePost(postId);
      
      // Update local state to reflect the like
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  const handleViewComments = (postId: string) => {
    navigation.navigate('Comments', { postId });
  };

  const handleSharePost = (postId: string) => {
    // Implement share functionality
    Alert.alert('Share', 'Sharing functionality will be implemented soon.');
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to attach images.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) {
      Alert.alert('Error', 'Please enter some content or attach an image.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const postData: any = {
        content: newPostContent.trim(),
      };
      
      if (selectedImage) {
        // In a real app, you would upload the image to a server first
        // and then include the URL in the attachments
        postData.attachments = [
          {
            type: 'image',
            url: selectedImage, // This would be the URL from your server
          },
        ];
      }
      
      await backendService.createPost(postData);
      
      // Clear form and refresh posts
      setNewPostContent('');
      setSelectedImage(null);
      setIsCreatingPost(false);
      fetchPosts();
      
      Alert.alert('Success', 'Your post has been created.');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    return (
      <View style={[styles.postContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.postHeader}>
          <View style={styles.authorContainer}>
            <View style={styles.avatarContainer}>
              {item.author.image ? (
                <Image source={{ uri: item.author.image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {item.author.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={[styles.authorName, { color: theme.colors.text }]}>
                {item.author.name}
              </Text>
              <Text style={[styles.postDate, { color: theme.colors.text + '80' }]}>
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.postContent, { color: theme.colors.text }]}>
          {item.content}
        </Text>
        
        {item.attachments && item.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {item.attachments.map((attachment, index) => {
              if (attachment.type === 'image') {
                return (
                  <Image
                    key={attachment.id || index}
                    source={{ uri: attachment.url }}
                    style={styles.attachmentImage}
                    resizeMode="cover"
                  />
                );
              }
              return null;
            })}
          </View>
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikePost(item.id)}
          >
            <Icon
              icon={Heart}
              size={20}
              color={item.liked ? theme.colors.error : theme.colors.text + '80'}
              fill={item.liked ? theme.colors.error : 'transparent'}
            />
            <Text style={[styles.actionText, { color: theme.colors.text + '80' }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewComments(item.id)}
          >
            <Icon icon={MessageSquare} size={20} color={theme.colors.text + '80'} />
            <Text style={[styles.actionText, { color: theme.colors.text + '80' }]}>
              {item.comments}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSharePost(item.id)}
          >
            <Icon icon={Share2} size={20} color={theme.colors.text + '80'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading posts...
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Social Feed</Text>
          <TouchableOpacity
            style={[styles.createPostButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setIsCreatingPost(!isCreatingPost)}
          >
            <Text style={styles.createPostButtonText}>
              {isCreatingPost ? 'Cancel' : 'New Post'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isCreatingPost && (
          <View style={[styles.createPostContainer, { backgroundColor: theme.colors.card }]}>
            <TextInput
              style={[styles.postInput, { color: theme.colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.text + '80'}
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              editable={!submitting}
            />
            
            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                  onPress={handleRemoveImage}
                  disabled={submitting}
                >
                  <Icon icon={X} size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.createPostActions}>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={handlePickImage}
                disabled={submitting}
              >
                <Icon icon={ImageIcon} size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: submitting || (!newPostContent.trim() && !selectedImage) ? 0.6 : 1,
                  },
                ]}
                onPress={handleCreatePost}
                disabled={submitting || (!newPostContent.trim() && !selectedImage)}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Icon icon={Send} size={20} color="#FFFFFF" style={styles.submitIcon} />
                    <Text style={styles.submitButtonText}>Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No posts yet. Be the first to post!
              </Text>
            </View>
          }
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createPostButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  createPostContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  postInput: {
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
    padding: 8,
  },
  selectedImageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  attachButton: {
    padding: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitIcon: {
    marginRight: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  postContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  attachmentsContainer: {
    marginBottom: 12,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
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
});

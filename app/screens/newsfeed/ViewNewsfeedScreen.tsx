import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Bell, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import Header from '../../../app/components/Header';
import { appStyles, Color } from '../../../styles/styles';

interface Post {
  id: string;
  type: 'alert' | 'info' | 'update';
  title: string;
  isViewed: boolean;
  status?: string;
}

const NewsfeedScreen = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generalPosts, setGeneralPosts] = useState<Post[]>([
    {
      id: '1',
      type: 'alert',
      title: 'Washing machine 3 will be in maintenance on July 14th from 9am to 1pm',
      isViewed: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Fiber optic cable will be installed on May 29th in the morning. Please use the south entrance instead.',
      isViewed: false,
    },
    {
      id: '3',
      type: 'alert',
      title: 'Remember that general inspections take place tomorrow afternoon.',
      isViewed: false,
    },
  ]);

  const [personalPosts, setPersonalPosts] = useState<Post[]>([
    {
      id: '4',
      type: 'alert',
      title: 'Your washing machine cycle is completed',
      isViewed: false,
    },
    {
      id: '5',
      type: 'update',
      title: 'Issue #3 : Radiator in bedroom',
      status: 'in progress',
      isViewed: false,
    },
  ]);

  const handleDismiss = (postId: string, isGeneral: boolean) => {
    if (isGeneral) {
      setGeneralPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, isViewed: true } : post
      ));
    } else {
      setPersonalPosts(posts => posts.map(post => 
        post.id === postId ? { ...post, isViewed: true } : post
      ));
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in progress':
        return Color.inProgress;
      case 'completed':
        return Color.completed;
      case 'rejected':
        return Color.rejected;
      default:
        return Color.default;
    }
  };

  const renderPost = (post: Post, isGeneral: boolean) => {
    const IconComponent = post.type === 'alert' ? Bell : Info;
    
    return (
      <TouchableOpacity
        key={post.id}
        style={[
          styles.postCard,
          post.isViewed && styles.viewedPost
        ]}
        onPress={() => handleDismiss(post.id, isGeneral)}
      >
        <View style={styles.postContent}>
          <IconComponent 
            size={24}
            color={Color.HeaderText}
            style={styles.icon}
          />
          <Text style={styles.postText}>{post.title}</Text>
        </View>
        {post.status && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(post.status) }]}>
            <Text style={styles.statusText}>Status changed to {post.status}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Header>
      <View style={styles.container}>
        <Text style={appStyles.flatTitle}>Newsfeed</Text>
        
        {/* General Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Important information regarding your residence
          </Text>
          <View style={[appStyles.grayGroupBackground, styles.postsContainer]}>
            {generalPosts
              .slice(0, isExpanded ? undefined : 2)
              .map(post => renderPost(post, true))}
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp size={24} color={Color.HeaderText} />
              ) : (
                <ChevronDown size={24} color={Color.HeaderText} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Updates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Updates for you</Text>
          <ScrollView style={styles.personalScrollView}>
            {personalPosts.map(post => renderPost(post, false))}
          </ScrollView>
        </View>
      </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Color.ScreenBackground,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: Color.HeaderText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  postsContainer: {
    borderRadius: 15,
    padding: 10,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: Color.ShadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  viewedPost: {
    opacity: 0.6,
  },
  postContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 10,
  },
  postText: {
    flex: 1,
    fontSize: 16,
    color: Color.TextInputText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  expandButton: {
    alignItems: 'center',
    padding: 10,
  },
  personalScrollView: {
    maxHeight: 300,
  },
  statusBadge: {
    borderRadius: 20,
    padding: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default NewsfeedScreen;
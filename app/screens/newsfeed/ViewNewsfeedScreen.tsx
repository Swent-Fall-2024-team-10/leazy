import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  RefreshControl,
} from 'react-native';
import { Bell, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import Header from '../../../app/components/Header';
import { appStyles, Color } from '../../../styles/styles';
import { Timestamp } from 'firebase/firestore';
import { News } from '../../../types/types';
import {
  getNewsByReceiver,
  markNewsAsRead,
} from '../../../firebase/firestore/firestore';

interface NewsfeedSectionProps {
  title: string;
  news: News[];
  onNewsPress: (news: News) => void;
  isExpandable?: boolean;
}

const NewsfeedSection: React.FC<NewsfeedSectionProps> = ({
  title,
  news,
  onNewsPress,
  isExpandable = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Enhanced sorting logic: urgent first, then unread, then by date
  const sortedNews = [...news].sort((a, b) => {
    // First sort by urgent status
    if (a.type === 'urgent' && b.type !== 'urgent') return -1;
    if (a.type !== 'urgent' && b.type === 'urgent') return 1;

    // Within same type (urgent/non-urgent), sort by read status
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }

    // Finally sort by date within each group
    return b.createdAt.seconds - a.createdAt.seconds;
  });

  const displayedNews = isExpandable
    ? isExpanded
      ? sortedNews
      : sortedNews.slice(0, 2)
    : sortedNews;

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const NewsIcon = ({ type }: { type: News['type'] }) => {
    if (type === 'urgent') {
      return <Bell size={24} color='#FF6B6B' style={styles.icon} />;
    }
    return <Info size={24} color={Color.HeaderText} style={styles.icon} />;
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[appStyles.grayGroupBackground, styles.postsContainer]}>
        {displayedNews.map((item) => (
          <TouchableOpacity
            key={item.maintenanceRequestID}
            style={[
              styles.postCard,
              item.isRead && styles.viewedPost,
              !item.isRead && styles.unreadPost,
            ]}
            onPress={() => onNewsPress(item)}
          >
            <View style={styles.postContent}>
              <NewsIcon type={item.type} />
              <View style={styles.postTextContainer}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.postTitle]}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.postText}>{item.content}</Text>
                <Text style={styles.timestamp}>
                  {formatDate(item.createdAt as Timestamp)}
                </Text>
              </View>
            </View>
            {item.images && item.images.length > 0 && (
              <ScrollView
                horizontal
                style={styles.imageScroll}
                showsHorizontalScrollIndicator={false}
              >
                {item.images.map((imageUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    style={styles.thumbnail}
                  />
                ))}
              </ScrollView>
            )}
          </TouchableOpacity>
        ))}
        {isExpandable && news.length > 2 && (
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
        )}
      </View>
    </View>
  );
};

const NewsfeedScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [generalNews, setGeneralNews] = useState<News[]>([]);
  const [personalNews, setPersonalNews] = useState<News[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const [generalNewsItems, personalNewsItems] = await Promise.all([
        getNewsByReceiver('all'),
        getNewsByReceiver('currentUserId'), // Replace with actual user ID
      ]);

      setGeneralNews(generalNewsItems);
      setPersonalNews(personalNewsItems);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNews().finally(() => setRefreshing(false));
  }, []);

  const handleNewsPress = async (news: News) => {
    // Prevent multiple rapid presses
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      // Update in Firestore first
      await markNewsAsRead(news.maintenanceRequestID);

      // After successful Firestore update, update local state
      if (news.ReceiverID === 'all') {
        setGeneralNews((prev) =>
          prev.map((item) =>
            item.maintenanceRequestID === news.maintenanceRequestID
              ? {
                  ...item,
                  isRead: true,
                  ReadAt: Timestamp.now(),
                }
              : item,
          ),
        );
      } else {
        setPersonalNews((prev) =>
          prev.map((item) =>
            item.maintenanceRequestID === news.maintenanceRequestID
              ? {
                  ...item,
                  isRead: true,
                  ReadAt: Timestamp.now(),
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error('Error marking news as read:', error);
      // Optionally show an error message to the user
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Header>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={appStyles.flatTitle}>Newsfeed</Text>

          <NewsfeedSection
            title='Important information regarding your residence'
            news={generalNews}
            onNewsPress={handleNewsPress}
            isExpandable={true}
          />

          <NewsfeedSection
            title='Updates for you'
            news={personalNews}
            onNewsPress={handleNewsPress}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
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
    borderRadius: 25,
    padding: 10,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 25,
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

  unreadPost: {
    backgroundColor: '#F8F9FA', // Slightly different background for unread posts
  },
  viewedPost: {
    opacity: 0.4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.ButtonBackground,
  },
  postContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 10,
  },
  postTextContainer: {
    flex: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Color.TextInputText,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  postText: {
    fontSize: 14,
    color: Color.TextInputText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  timestamp: {
    fontSize: 12,
    color: Color.GrayText,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  expandButton: {
    alignItems: 'center',
    padding: 10,
  },
  imageScroll: {
    marginTop: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default NewsfeedScreen;

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
  Alert,
} from 'react-native';
import { Bell, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import Header from '../../../app/components/Header';
import { appStyles, Color } from '../../../styles/styles';
import { Timestamp } from 'firebase/firestore';
import { News } from '../../../types/types';
import {
  getNewsByReceiver,
  markNewsAsRead,
  deleteNews,
} from '../../../firebase/firestore/firestore';
import { useAuth } from '../../context/AuthContext';

interface NewsfeedSectionProps {
  title: string;
  news: News[];
  onNewsPress: (news: News) => void;
  isExpandable?: boolean;
}

const TEN_MINUTES_IN_SECONDS = 600;

const isPostVisible = (news: News) => {
  if (!news.isRead || !news.ReadAt) return true;

  const readAtSeconds = news.ReadAt.seconds;
  const currentSeconds = Timestamp.now().seconds;
  return currentSeconds - readAtSeconds < TEN_MINUTES_IN_SECONDS;
};

const NewsfeedSection: React.FC<NewsfeedSectionProps> = ({
  title,
  news,
  onNewsPress,
  isExpandable = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out posts that were read more than an hour ago
  const visibleNews = news.filter(isPostVisible);

  // Deduplicate news items
  const deduplicatedNews = visibleNews.reduce((unique: News[], item) => {
    // Check if we already have a news item with the same content and timestamp
    const isDuplicate = unique.some(
      (existingItem) =>
        existingItem.content === item.content &&
        existingItem.createdAt.seconds === item.createdAt.seconds,
    );

    if (!isDuplicate) {
      unique.push(item);
    }
    return unique;
  }, []);

  // sorting logic: urgent first, then unread, then by date
  const sortedNews = [...deduplicatedNews].sort((a, b) => {
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

  // Say there are no news
  if (visibleNews.length === 0) {
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={appStyles.sectionTitle}>{title}</Text>
        <Text style={appStyles.flatText}>Nothing new to show</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={appStyles.sectionTitle}>{title}</Text>
      <View style={[appStyles.grayGroupBackground, styles.postsContainer]}>
        {displayedNews.map((item) => (
          <TouchableOpacity
            key={item.maintenanceRequestID}
            style={[
              styles.postCard,
              item.isRead && { opacity: 0.4 },
              !item.isRead && { backgroundColor: '#F8F9FA' },
            ]}
            onPress={() => onNewsPress(item)}
          >
            <View style={styles.postContent}>
              <NewsIcon type={item.type} />
              <View style={{ flex: 1 }}>
                <View style={styles.titleContainer}>
                  <Text style={[appStyles.postTitle]}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={appStyles.flatText}>{item.content}</Text>
                <Text style={appStyles.timestamp}>
                  {formatDate(item.createdAt as Timestamp)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {isExpandable && visibleNews.length > 2 && (
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
  const { tenant } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [generalNews, setGeneralNews] = useState<News[]>([]);
  const [personalNews, setPersonalNews] = useState<News[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add an effect to periodically check for expired posts
  useEffect(() => {
    const checkExpiredPosts = () => {
      setGeneralNews((prev) => [...prev]); // Force re-render to update visibility
      setPersonalNews((prev) => [...prev]);
    };

    const interval = setInterval(checkExpiredPosts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tenant) {
      fetchNews();
    }
  }, [tenant]);

  const fetchNews = async () => {
    if (!tenant) return;

    try {
      const [generalNewsItems, personalNewsItems] = await Promise.all([
        getNewsByReceiver('all'),
        getNewsByReceiver(tenant.userId),
      ]);

      // Function to find and delete duplicates
      const deduplicateNewsInFirestore = async (newsItems: News[]) => {
        const seen = new Map<string, News>();
        const duplicates: string[] = [];

        // Group by content and timestamp
        newsItems.forEach((item) => {
          const key = `${item.content}_${item.createdAt.seconds}`;
          if (!seen.has(key)) {
            seen.set(key, item);
          } else {
            // Keep the older item (by maintenanceRequestID)
            const existingItem = seen.get(key)!;
            if (existingItem.maintenanceRequestID > item.maintenanceRequestID) {
              duplicates.push(existingItem.maintenanceRequestID);
              seen.set(key, item);
            } else {
              duplicates.push(item.maintenanceRequestID);
            }
          }
        });

        // Delete duplicates from Firestore
        if (duplicates.length > 0) {
          try {
            console.log('Deleting duplicate news items:', duplicates.length);
            const deletePromises = duplicates.map((id) => deleteNews(id));
            await Promise.all(deletePromises);
          } catch (error) {
            Alert.alert(
              'Warning',
              "Some duplicate news items could not be removed. This won't affect your experience.",
              [{ text: 'OK' }],
            );
          }
        }

        // Return deduplicated array
        return Array.from(seen.values());
      };

      // Deduplicate and update state
      const deduplicatedGeneralNews =
        await deduplicateNewsInFirestore(generalNewsItems);
      const deduplicatedPersonalNews =
        await deduplicateNewsInFirestore(personalNewsItems);

      setGeneralNews(deduplicatedGeneralNews);
      setPersonalNews(deduplicatedPersonalNews);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to fetch news. Please pull down to refresh and try again.',
        [{ text: 'OK' }],
      );
      console.error('Error fetching news:', error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNews().finally(() => setRefreshing(false));
  }, [tenant]);

  const handleNewsPress = async (news: News) => {
    if (isUpdating || !tenant) return;

    try {
      setIsUpdating(true);
      await markNewsAsRead(news.maintenanceRequestID);

      const updateNews = (prev: News[]) =>
        prev.map((item) =>
          item.maintenanceRequestID === news.maintenanceRequestID
            ? {
                ...item,
                isRead: true,
                ReadAt: Timestamp.now(),
              }
            : item,
        );

      if (news.ReceiverID === 'all') {
        setGeneralNews(updateNews);
      } else {
        setPersonalNews(updateNews);
      }

      // Show success alert for urgent news
      if (news.type === 'urgent') {
        Alert.alert(
          'Important Notice Acknowledged',
          'You have marked this urgent notification as read.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to mark notification as read. Please try again.',
        [{ text: 'OK' }],
      );
      console.error('Error marking news as read:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle loading state
  if (!tenant) {
    return (
      <Header>
        <View
          style={{
            flex: 0.7,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text
            style={[
              appStyles.flatTitle,
              { textAlign: 'center', marginBottom: 8 },
            ]}
          >
            Setting Up Your Newsfeed
          </Text>
          <Text style={[appStyles.flatText, { textAlign: 'center' }]}>
            We're getting your latest updates and important notifications ready.
            This should only take a moment.
          </Text>
        </View>
      </Header>
    );
  }

  return (
    <Header>
      <View style={{ flex: 0.7 }}>
        <ScrollView
          testID='newsfeed-scroll'
          style={{ flex: 1 }}
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
  scrollViewContent: {
    padding: 20,
    flexGrow: 1,
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
  expandButton: {
    alignItems: 'center',
    padding: 10,
  },
  bottomPadding: {
    height: 20,
  },
});

export default NewsfeedScreen;

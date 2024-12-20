import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl, Alert } from 'react-native';
import { Bell, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import Header from '../../../app/components/Header';
import { appStyles, Color } from '../../../styles/styles';
import { Timestamp } from 'firebase/firestore';
import { News } from '../../../types/types';
import { getNewsByReceiver, markNewsAsRead, deleteNews } from '../../../firebase/firestore/firestore';
import { useAuth } from '../../context/AuthContext';

// Constants and Types
const TEN_MINUTES_IN_SECONDS = 600;
interface NewsfeedSectionProps {
  title: string;
  news: News[];
  onNewsPress: (news: News) => void;
  isExpandable?: boolean;
}

// Utility Functions
export const isPostVisible = (news: News) => 
  !news.isRead || !news.ReadAt || 
  (Timestamp.now().seconds - news.ReadAt.seconds) < TEN_MINUTES_IN_SECONDS;

export const formatDate = (timestamp: Timestamp) => 
  timestamp.toDate().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

export const deduplicateNews = (news: News[]) => {
  const seen = new Map();
  return news.reduce((unique: News[], item) => {
    const key = `${item.content}_${item.createdAt.seconds}`;
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(item);
    }
    return unique;
  }, []);
};

const sortNews = (news: News[]) => 
  [...news].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'urgent' ? -1 : 1;
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return b.createdAt.seconds - a.createdAt.seconds;
  });

// Components
const NewsIcon: React.FC<{ type: News['type'] }> = ({ type }) => (
  <View style={styles.icon}>
    {type === 'urgent' ? 
      <Bell size={24} color='#FF6B6B' /> : 
      <Info size={24} color={Color.HeaderText} />}
  </View>
);

export const NewsfeedSection: React.FC<NewsfeedSectionProps> = ({ title, news, onNewsPress, isExpandable = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleNews = sortNews(deduplicateNews(news.filter(isPostVisible)));
  const displayedNews = isExpandable ? (isExpanded ? visibleNews : visibleNews.slice(0, 2)) : visibleNews;

  if (!visibleNews.length) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={appStyles.sectionTitle}>{title}</Text>
        <Text style={appStyles.flatText}>Nothing new to show</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={appStyles.sectionTitle}>{title}</Text>
      <View style={[appStyles.grayGroupBackground, styles.postsContainer]}>
        {displayedNews.map(item => (
          <TouchableOpacity
            testID={`news-item-${item.maintenanceRequestID}`}
            key={item.maintenanceRequestID}
            style={[styles.postCard, { opacity: item.isRead ? 0.4 : 1, backgroundColor: item.isRead ? 'white' : '#F8F9FA' }]}
            onPress={() => onNewsPress(item)}
          >
            <View style={styles.postContent}>
              <NewsIcon type={item.type} />
              <View style={{ flex: 1 }}>
                <View style={styles.titleContainer}>
                  <Text style={appStyles.postTitle}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={appStyles.flatText}>{item.content}</Text>
                <Text style={appStyles.timestamp}>{formatDate(item.createdAt as Timestamp)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {isExpandable && visibleNews.length > 2 && (
          <TouchableOpacity 
            testID="expand-button"
            style={styles.expandButton} 
            onPress={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp size={24} color={Color.HeaderText} /> : <ChevronDown size={24} color={Color.HeaderText} />}
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

  const fetchNews = async () => {
    if (!tenant) return;
    
    try {
      const [generalNewsItems, personalNewsItems] = await Promise.all([
        getNewsByReceiver('all'),
        getNewsByReceiver(tenant.userId),
      ]);

      const deduplicateNewsInFirestore = async (newsItems: News[]) => {
        const seen = new Map<string, News>();
        const duplicates: string[] = [];

        newsItems.forEach(item => {
          const key = `${item.content}_${item.createdAt.seconds}`;
          if (seen.has(key)) {
            const existingItem = seen.get(key)!;
            duplicates.push(existingItem.maintenanceRequestID > item.maintenanceRequestID ? 
              existingItem.maintenanceRequestID : item.maintenanceRequestID);
          } else {
            seen.set(key, item);
          }
        });

        if (duplicates.length) {
          await Promise.all(duplicates.map(deleteNews))
            .catch(error => Alert.alert('Warning', 
              "Some duplicate news items could not be removed. This won't affect your experience."));
        }

        return Array.from(seen.values());
      };

      setGeneralNews(await deduplicateNewsInFirestore(generalNewsItems));
      setPersonalNews(await deduplicateNewsInFirestore(personalNewsItems));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch news. Please pull down to refresh and try again.');
    }
  };

  const handleNewsPress = async (news: News) => {
    if (isUpdating || !tenant) return;
    
    try {
      setIsUpdating(true);
      await markNewsAsRead(news.maintenanceRequestID);

      const updateNews = (prev: News[]) =>
        prev.map(item => item.maintenanceRequestID === news.maintenanceRequestID ? 
          { ...item, isRead: true, ReadAt: Timestamp.now() } : item);

      news.ReceiverID === 'all' ? setGeneralNews(updateNews) : setPersonalNews(updateNews);

      if (news.type === 'urgent') {
        Alert.alert('Important Notice Acknowledged', 'You have marked this urgent notification as read.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setGeneralNews(prev => [...prev]);
      setPersonalNews(prev => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tenant) fetchNews();
  }, [tenant]);

  if (!tenant) {
    return (
      <Header>
        <View style={styles.loadingContainer}>
          <Text style={[appStyles.flatTitle, styles.centerText]}>Setting Up Your Newsfeed</Text>
          <Text style={[appStyles.flatText, styles.centerText]}>
            We're getting your latest updates and important notifications ready. This should only take a moment.
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchNews().finally(() => setRefreshing(false));
          }} />}
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
  scrollViewContent: { padding: 20, flexGrow: 1 },
  sectionContainer: { marginBottom: 20 },
  postsContainer: { borderRadius: 25, padding: 10 },
  postCard: {
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
      android: { elevation: 3 },
    }),
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.ButtonBackground,
  },
  postContent: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { marginRight: 10 },
  expandButton: { alignItems: 'center', padding: 10 },
  bottomPadding: { height: 20 },
  loadingContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerText: { textAlign: 'center', marginBottom: 8 },
});

export default NewsfeedScreen;
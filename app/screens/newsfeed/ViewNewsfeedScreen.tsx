import React, { useState } from 'react';
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
import 'react-native-gesture-handler';
import { News } from '../../../types/types';

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
  const displayedNews = isExpandable ? (isExpanded ? news : news.slice(0, 2)) : news;

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[appStyles.grayGroupBackground, styles.postsContainer]}>
        {displayedNews.map((item) => (
          <TouchableOpacity
            key={item.maintenanceRequestID}
            style={[styles.postCard, item.isRead && styles.viewedPost]}
            onPress={() => onNewsPress(item)}
          >
            <View style={styles.postContent}>
              <Info size={24} color={Color.HeaderText} style={styles.icon} />
              <View style={styles.postTextContainer}>
                <Text style={styles.postTitle}>{item.title}</Text>
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
  const [generalNews, setGeneralNews] = useState<News[]>([
    {
      maintenanceRequestID: '1',
      SenderID: 'admin',
      ReceiverID: 'all',
      title: 'Maintenance Notice',
      content: 'Washing machine 3 will be in maintenance on July 14th from 9am to 1pm',
      isRead: false,
      createdAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      type: "urgent",
      images: [],
    },
    {
      maintenanceRequestID: '2',
      SenderID: 'admin',
      ReceiverID: 'all',
      title: 'Fiber Installation',
      content: 'Fiber optic cable will be installed on May 29th in the morning. Please use the south entrance instead.',
      isRead: false,
      createdAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      images: [],
      type: "informational",
    },
    {
      maintenanceRequestID: '3',
      SenderID: 'admin',
      ReceiverID: 'all',
      title: 'General Inspection',
      content: 'Remember that general inspections take place tomorrow afternoon.',
      isRead: false,
      createdAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      images: [],
      type: "informational",
    },
  ]);

  const [personalNews, setPersonalNews] = useState<News[]>([
    {
      maintenanceRequestID: '4',
      SenderID: 'system',
      ReceiverID: 'user123',
      title: 'Laundry Notification',
      content: 'Your washing machine cycle is completed',
      isRead: false,
      createdAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      images: [],
      type: "informational",
    },
    {
      maintenanceRequestID: '5',
      SenderID: 'system',
      ReceiverID: 'user123',
      title: 'Maintenance Update',
      content: 'Your maintenance request for the radiator has been updated to "in progress"',
      isRead: false,
      createdAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      images: [],
      type: "informational",
    },
    {
      maintenanceRequestID: '6',
      SenderID: 'system',
      ReceiverID: 'user123',
      title: 'Issue Resolution',
      content: 'The maintenance team has resolved your reported issue with the kitchen sink.',
      isRead: false,
      createdAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      images: [],
      type: "informational",
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add fetch logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleNewsPress = async (news: News) => {
    // Update read status in local state
    if (news.ReceiverID === 'all') {
      setGeneralNews(prev =>
        prev.map(item =>
          item.maintenanceRequestID === news.maintenanceRequestID
            ? { ...item, isRead: true }
            : item
        )
      );
    } else {
      setPersonalNews(prev =>
        prev.map(item =>
          item.maintenanceRequestID === news.maintenanceRequestID
            ? { ...item, isRead: true }
            : item
        )
      );
    }

    // TODO: Update in Firestore
  };

  return (
    <Header>
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
          title="Important information regarding your residence"
          news={generalNews}
          onNewsPress={handleNewsPress}
          isExpandable={true}
        />

        <NewsfeedSection
          title="Updates for you"
          news={personalNews}
          onNewsPress={handleNewsPress}
        />
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </Header>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Color.ScreenBackground,
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
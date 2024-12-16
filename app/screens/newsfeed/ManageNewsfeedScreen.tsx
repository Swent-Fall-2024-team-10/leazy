import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Bell, Info, Plus, X } from 'lucide-react-native';
import Header from '../../../app/components/Header';
import { appStyles, Color } from '../../../styles/styles';
import { News } from '../../../types/types';
import { Timestamp } from 'firebase/firestore';
import {
  createNews,
  updateNews,
  deleteNews,
  getNewsByReceiver,
} from '../../../firebase/firestore/firestore';
import SubmitButton from '../../components/buttons/SubmitButton';
import CustomTextField from '../../components/CustomTextField';
import Close from '../../components/buttons/Close';

interface NewsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (news: Partial<News>) => void;
  editingNews?: News;
}

const NewsModal: React.FC<NewsModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingNews,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (editingNews) {
      setTitle(editingNews.title);
      setContent(editingNews.content);
      setIsUrgent(editingNews.type === 'urgent');
    } else {
      setTitle('');
      setContent('');
      setIsUrgent(false);
    }
  }, [editingNews, visible]);

  const handleSubmit = () => {
    const newsData: Partial<News> = {
      title: title.trim(),
      content,
      type: isUrgent ? 'urgent' : 'informational',
      isRead: false,
      createdAt: Timestamp.now(),
      UpdatedAt: Timestamp.now(),
      ReadAt: Timestamp.now(),
      images: [],
      ReceiverID: 'all', // Public post
    };
    onSubmit(newsData);
    setTitle('');
    setContent('');
    setIsUrgent(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalFormContent}>
            <View style={appStyles.modalHeader}>
              <Text style={appStyles.modalTitle}>
                Add to the residence Newsfeed
              </Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
                <X size={24} color={Color.TextInputText} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputFields}>
              <CustomTextField
                testID='title-input'
                placeholder='Enter title'
                value={title}
                onChangeText={setTitle}
                style={appStyles.inputFieldLabel}
              />

              <CustomTextField
                testID='content-input'
                placeholder='What would you like to announce?'
                value={content}
                onChangeText={setContent}
                style={appStyles.inputFieldLabel}
              />
            </View>

            <Text style={appStyles.flatText}>
              How would you like the post to appear for tenants?
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.typeButton, isUrgent && styles.selectedButton]}
                onPress={() => setIsUrgent(true)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isUrgent && styles.selectedButtonText,
                  ]}
                >
                  Set as urgent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeButton, !isUrgent && styles.selectedButton]}
                onPress={() => setIsUrgent(false)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    !isUrgent && styles.selectedButtonText,
                  ]}
                >
                  Set as informational
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!content.trim() || !title.trim()) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || !title.trim()}
          >
            <Text style={styles.submitButtonText}>Add to newsfeed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const NewsfeedManagementScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [news, setNews] = useState<News[]>([]);
  const [editingNews, setEditingNews] = useState<News | undefined>();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const newsItems = await getNewsByReceiver('all');
      setNews(newsItems);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleCreateNews = async (newsData: Partial<News>) => {
    try {
      const newNews: News = {
        ...newsData,
        maintenanceRequestID: `news_${Date.now()}`,
        SenderID: 'landlord', // Replace with actual landlord ID
      } as News;

      await createNews(newNews);
      await fetchNews();
      setModalVisible(false);
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const handleUpdateNews = async (newsData: Partial<News>) => {
    if (!editingNews) return;

    try {
      await updateNews(editingNews.maintenanceRequestID, newsData);
      await fetchNews();
      setModalVisible(false);
      setEditingNews(undefined);
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    try {
      await deleteNews(newsId);
      await fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };

  const NewsIcon = ({ type }: { type: News['type'] }) => {
    if (type === 'urgent') {
      return <Bell size={24} color={Color.HeaderText} />;
    }
    return <Info size={24} color={Color.HeaderText} />;
  };

  return (
    <Header>
      <View style={styles.container}>
        <Text style={appStyles.flatTitle}>Newsfeed management</Text>

        <SubmitButton
          testID='add-news-button'
          label='+ Add News'
          onPress={() => {
            setEditingNews(undefined);
            setModalVisible(true);
          }}
          disabled={false}
          width={200}
          height={44}
          style={[appStyles.submitButton, styles.addNewsButton]}
        />

        <View style={[appStyles.grayGroupBackground, styles.newsContainer]}>
          <Text style={appStyles.sectionTitle}>Currently active news</Text>

          <ScrollView style={{ flex: 1 }}>
            {news.map((item) => (
              <View key={item.maintenanceRequestID} style={styles.newsItem}>
                <NewsIcon type={item.type} />
                <View style={styles.newsContent}>
                  <View style={styles.newsHeader}>
                    <Text style={appStyles.tenantsTitle}>{item.title}</Text>
                    <Text>{item.createdAt.toDate().toLocaleDateString()}</Text>
                  </View>
                  <Text style={appStyles.flatText}>{item.content}</Text>
                  <View style={styles.actionButtons}>
                    <SubmitButton
                      testID='edit-news-button'
                      label='Edit'
                      onPress={() => {
                        setEditingNews(item);
                        setModalVisible(true);
                      }}
                      disabled={false}
                      width={100}
                      height={40}
                      style={styles.editButton}
                    />
                    <SubmitButton
                      testID='delete-news-button'
                      label='Delete'
                      onPress={() =>
                        handleDeleteNews(item.maintenanceRequestID)
                      }
                      disabled={false}
                      width={100}
                      height={40}
                      style={styles.deleteButton}
                    />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <NewsModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setEditingNews(undefined);
          }}
          onSubmit={editingNews ? handleUpdateNews : handleCreateNews}
          editingNews={editingNews}
        />
      </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  inputFields: {
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Color.TextInputText,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#FFA500', // Orange color for Edit button
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B', // Red color for Delete button
    width: 100,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  editButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
  deleteButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },

  titleInput: {
    borderWidth: 1,
    borderColor: Color.TextInputBorder,
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: Color.TextInputText,
    backgroundColor: 'white',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  addNewsButton: {
    marginVertical: 15,
    alignSelf: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  newsContainer: {
    flex: 0.68,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: Color.ScreenBackground,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
  },

  newsList: {
    flex: 1,
  },
  newsItem: {
    flexDirection: 'row',
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
  newsContent: {
    flex: 1,
    marginLeft: 10,
  },
  newsText: {
    fontSize: 16,
    color: Color.TextInputText,
    marginBottom: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 20,
    minHeight: 400, // Add minimum height to ensure proper spacing
    flexDirection: 'column',
    justifyContent: 'space-between', // Add this to create space between content
    display: 'flex', // Ensure flex layout
  },
  modalFormContent: {
    flex: 1, // Take up available space
  },

  submitButton: {
    backgroundColor: Color.ButtonBackground,
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto', // Push button to bottom
  },

  textInput: {
    borderWidth: 1,
    borderColor: Color.TextInputBorder,
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: Color.TextInputText,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  subtitleText: {
    fontSize: 16,
    color: Color.TextInputText,
    marginBottom: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Color.ButtonBackground,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: Color.ButtonBackground,
  },
  buttonText: {
    color: Color.ButtonBackground,
  },
  selectedButtonText: {
    color: 'white',
  },

  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewsfeedManagementScreen;
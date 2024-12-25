import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentMessages, selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector';
import { useContext, useEffect, useState } from 'react';
import MessageComponent from './MessageComponent';
import { SET_ROUTE, setCurrentMessages, SetUnreadMessages } from '../../store/user/user.action';
import { Ionicons } from 'react-native-vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { UserContext } from '../../store/userContext';
import { getTheme } from '../Colors/Color';
import { EXPO_PUBLIC_API_URL } from '@env';

export default function Messages() {
    const user = useSelector(selectCurrentUser);
    const messages = useSelector(selectCurrentMessages);
    const [load, setLoad] = useState(false);
    const [showLoadingBar , setShowLoadingBar] = useState(false)
    const dispatch = useDispatch();
    const navigation = useNavigation();  // Use useNavigation hook
    const { PathUserMessage, setPathUserMessage } = useContext(UserContext);
    const isFocused = useIsFocused(); // Hook to detect if screen is focused
    const isDarkMode = useSelector(selectCurrentTheme)
    const Color = getTheme(isDarkMode); // Get the theme based on the mode
    useEffect(() => {
        if(!isFocused) return
        dispatch(SET_ROUTE('Messages'))
    }, [isFocused])

    const fetchMessages = async (firstLoad = false) => {
        if (load) return;
        if (!user) return;
        
        try {
            setShowLoadingBar(true)
            const fetchMessages = await fetch(`${EXPO_PUBLIC_API_URL}/getAllMessages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id , skip:firstLoad ? 0  : messages.length})
            });

            const data = await fetchMessages.json();
            if (data.error) return setLoad(false);
            if(data.length >=10){
                setLoad(false)
            }
            // let UnreadCount = []
            // data.map(message => {
            //     if(message.unreadMessagesCount > 0)
            //         UnreadCount.push({Unread : message.unreadMessagesCount, chatId : message.chatId })
            // })
            // dispatch(SetUnreadMessages(UnreadCount))
            dispatch(setCurrentMessages([...data]));
        } catch (e) {
            console.error('error in fetch messages : ',e);
            setLoad(false);
        }
        finally{
            setShowLoadingBar(false)
        }
    };

    useEffect(() => {
        

        if (user && !load) {
            setLoad(true);
            fetchMessages(true);
        }
    }, []);

    useEffect(() => {
        if (!user || !PathUserMessage) return;
        const recipient = messages
            .flatMap(data => data.participants)
            .find(_user => _user.username !== user.username);
        if (recipient && PathUserMessage.username === recipient.username) {
            setPathUserMessage({ username: '' });
            navigation.navigate('ChatScreen', {
                username: recipient.username,
                recipient,
                profile_img: recipient.profile_img,
                _id: recipient._id,
                messages: messages.find(m => m.participants.includes(recipient)).messages,
                CommentNavigate: 'Profile',
            });
        } else if (PathUserMessage.profile_img) {
            // console.log('get here' , PathUserMessage)
            navigation.navigate('ChatScreen', {
                username: PathUserMessage.username,
                recipient: PathUserMessage.recipient,
                profile_img: PathUserMessage.profile_img,
                _id: PathUserMessage._id,
                CommentNavigate: 'Profile'
            });
            setPathUserMessage({ username: '' });
        }
    }, [messages, PathUserMessage, user, navigation, setPathUserMessage]);

    const sortedMessages = messages.slice().sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1]?.timestamp;
        const lastMsgB = b.messages[b.messages.length - 1]?.timestamp;
        return new Date(lastMsgB) - new Date(lastMsgA);
    });

    if (!user) return null;

    return (
        <View style={[styles.container, {backgroundColor: Color.BACKGROUND}]}>
            {!showLoadingBar && sortedMessages.length <= 0 ?
                <View style={styles.emptyContainer}>
                    <Ionicons name={'chatbubbles-outline'} size={120} color={Color.TEXT} />
                    <Text style={styles.emptyText}>Your messages</Text>
                    <Text style={styles.emptySubText}>Send a message to start a chat</Text>
                    <TouchableOpacity activeOpacity={0.6} style={styles.sendMessageButton}>
                        <Text style={styles.sendMessageText}>Send message</Text>
                    </TouchableOpacity>
                </View>
                :
                <FlatList
                    data={sortedMessages}
                    renderItem={({ item, index }) => (
                        <MessageComponent key={index} index={index} data={item} userPath={PathUserMessage} />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.containerMessages}
                    ListFooterComponent={showLoadingBar ? (
                        <View style={{ paddingVertical: 20 }}>
                            <ActivityIndicator size={50} color="#0000ff" />

                        </View>
                    ) : null} // Show loading indicator
                    onEndReached={fetchMessages}
                    onEndReachedThreshold={1}
                />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    emptyText: {
        color: Color.TEXT,
        fontSize: 28,
        fontWeight: 'bold'
    },
    emptySubText: {
        color: Color.TEXT,
        fontSize: 16,
        fontWeight: '500'
    },
    sendMessageButton: {
        backgroundColor: Color.PRIMARY_BUTTON,
        padding: 12,
        borderRadius: 18
    },
    sendMessageText: {
        color: Color.TEXT,
        fontSize: 16,
        fontWeight: 'bold'
    },
    containerMessages: {
        flex: 1,
        flexDirection: 'column',
        gap: 10
    }
});

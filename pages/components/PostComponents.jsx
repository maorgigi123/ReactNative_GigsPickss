import { View, Text, Alert,StyleSheet,FlatList,Dimensions, TouchableOpacity, TextInput, ScrollView, Vibration, Pressable, ActivityIndicator, Keyboard} from 'react-native'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
// import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Feather from 'react-native-vector-icons/Feather';
import ProfileImage from './ProfileImage';
import { CalcData } from '../../utils/CalcData';
import { getTheme } from '../Colors/Color';
import ZoomableImage from './ZoomableImage';
import { Video } from 'expo-av';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import ReadMore, { SmartReadMore } from './ReadMore';
import styled from 'styled-components/native';
import { useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser } from '../../store/user/user.selector';
import {BottomSheetFooter, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ImageZoom } from '@likashefqet/react-native-image-zoom';
import AnimatedDotsCarousel from 'react-native-animated-dots-carousel';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage';
import { selectCurrentWs } from '../../store/webSocket/ws.selector';
import Toast from 'react-native-toast-message';
import PicksComponent from './PicksComponent';
import { EXPO_PUBLIC_API_URL } from '@env';
import DropShadow from "react-native-drop-shadow";
const AllCommentsContainer = styled.View`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    height:'100%';
`;
const CommentsAllContainer = styled.View`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-right: 20px;
`
const RepliesAllContainer = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 44px);
  margin-left: 44px;
  margin-bottom: 10px;
`
const CommentsHeaderAuthor = styled.View`
    display: flex;
    align-items: start;
    flex-direction: row;
    gap: 10px;
`;

const CommentsHeader = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: start;

    margin: 12px 12px 0px 12px;
`;
const DataComment = styled.Text`
  font-weight: bold;
  font-size: 12px;
    margin: 12px 12px 0px 12px;
`;
const BottomContainerComment = styled.View`
  display: flex;
  width: 100%;
  align-items: start;
  margin-left: 46px;
  margin-top: -8px;
  flex-direction: row;
`;

const TranslateSpan = styled.Text`
    margin: 12px 12px 0px 0px;
    font-size: 12px;
    font-weight: bold;

`;


const AuthorIcon = styled.Image`
    width:35px;
    height: 35px;
    /* border-radius: 17.5px; // Instead of 50% */
    object-fit: fill;
    border-radius: 50px;
`;
const AuthorName = styled.Text`
    font-weight: bold;
`;


const ContainerCommentsPrevire = styled(View)`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  flex-direction:row;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
`;

const CommentsPreviewLeft = styled(View)`
  font-size:.8em;
  display: flex;
  gap: 10px;
  flex-direction: row;
  width: 90%;
  align-items: center;
`;
const CommentsPreviewName = styled(Text)`
  font-weight: bold;
`;
const CommentPreviewImage = styled(Image)`
height: 30px;
width: 30px;
border-radius: 50px;
    /* border-radius: 10px; // Instead of 50% */
`;
const AuthorContent = styled.View`
 font-weight: bold;
    /* overflow: hidden;
  word-break: break-all; */
  min-height: 20px;
  margin-top: 3px;
  margin-right: 5px;
  gap: 5;
  overflow: hidden; /* Hides overflowed text */
  text-overflow: ellipsis; /* Adds an ellipsis (...) to indicate overflow */
  white-space: normal; /* Allows text to wrap to the next line */
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;
const NoCommentsContainer = styled.View`
  width: 100%;
  height: 75%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 30px;
`;
const NoCommentsText = styled.Text`
font-size: 1.5em;
`;
function ReplayComment({comments,post,handleAddLike ,navigation,CommentNavigate,handleCloseModal,ChatNavigate,like, Color,setReplayTo,PostCommentInput}) {
  const [commentLikes,setCommentLike] = useState(like)
  const [commentLikesCount,setCommentLikeCount] = useState(comments.likesCount)
  
  return (
    <RepliesAllContainer>
    <CommentsHeader>
   <CommentsHeaderAuthor>
    <TouchableOpacity activeOpacity={.9} onPress={() => {
                  handleCloseModal()
                  navigation.push(CommentNavigate, {
                    username: comments.user_id.username,
                    back:true,
                    ChatNavigate:ChatNavigate,
                    CommentNavigate:CommentNavigate
                }); 
        }}>
        <AuthorIcon src={`${EXPO_PUBLIC_API_URL}/uploads/${comments.user_id.profile_img}`} alt="Author Icon"/> 
    </TouchableOpacity>
     
     <View style={{display:'flex',width:'85%'}}>
     <TouchableOpacity activeOpacity={.9} onPress={() => {
                handleCloseModal()
                navigation.push(CommentNavigate, {
                  username: comments.user_id.username,
                  back:true,
                  ChatNavigate:ChatNavigate,
                  CommentNavigate:CommentNavigate
              }); 
        }}>
      <AuthorName style={{color:Color.TEXT}}>{comments.user_id.username}</AuthorName>
     </TouchableOpacity>


     <AuthorContent>
      {comments.replayTo_id?.username &&
        <TouchableOpacity onPress={() => {
          handleCloseModal()
          navigation.push(CommentNavigate, {
            username: comments.replayTo_id.username,
            back:true,
            ChatNavigate:ChatNavigate,
            CommentNavigate:CommentNavigate
        }); 
        }}>
              <Text style={{color:Color.PRIMARY_BUTTON,fontSize:14,lineHeights:16,fontWeight:'400'}}>@{comments.replayTo_id.username}</Text>
        </TouchableOpacity>
      }
           <ReadMore text={comments.content} color={Color.TEXT}> </ReadMore>
      </AuthorContent>

     </View>
     
   </CommentsHeaderAuthor>
   <TouchableOpacity onPress={() => {handleAddLike(comments,setCommentLike,setCommentLikeCount)}}>
          {commentLikes ? <AntDesign name="heart" size={20} color="red" /> :  <Feather name="heart" size={20} color={Color.TEXT}/> }
    </TouchableOpacity>
 </CommentsHeader>

     <BottomContainerComment>
             <DataComment style={{color:Color.TEXT}}>{CalcData(comments.createdAt)}</DataComment>
             {commentLikesCount > 0 &&  <TranslateSpan style={{color:Color.TEXT}}>{commentLikesCount} {commentLikesCount > 1 ? 'likes' : 'like'}</TranslateSpan>}
             <TouchableOpacity opacity={.8} onPress={() => {setReplayTo({comment : post , replayTo:comments.user_id});setTimeout(() => { PostCommentInput.current?.focus()},300)}}>
                 <TranslateSpan style={{color:Color.TEXT}}>Reply</TranslateSpan>
             </TouchableOpacity>
             {/* <TranslateSpan style={{color:Color.TEXT}}>See translation</TranslateSpan> */}
       </BottomContainerComment>
 </RepliesAllContainer>
  )

}
// Function to render comment header
function CommentHeaderComponent({ post,user,handleAddLike,navigation,CommentNavigate ,handleCloseModal,ChatNavigate,like , Color,setReplayTo, PostCommentInput,showMyComments , hideID =[]}) {
  const likeHearthRef = useRef()
  const [commentLikesCount,setCommentLikeCount] = useState(like)
  const [replies , setReplies] = useState([])
  const [loadMoreReplies , setLoadMoreReplies] = useState(false)
  const [repliesID, setRepliedId] = useState([])

  const addNewReplay = (commentPost) => {
    const newCommentHeader = <ReplayComment key={`commentReplayHeaders.length${commentPost.createdAt}_${user.username}to${commentPost.user_id.username}`} post= {post} comments={commentPost} handleAddLike={handleAddLikeComment} navigation={navigation} CommentNavigate={CommentNavigate} handleCloseModal={handleCloseModal} ChatNavigate={ChatNavigate} like={commentPost.likes.some(like => like === user._id)} Color={Color} setReplayTo={setReplayTo} PostCommentInput={PostCommentInput}/>;
    setReplies(prevCommentHeaders => [...prevCommentHeaders,newCommentHeader]);
  
  };
  const addFirstNewReplay = (commentPost) => {
    const newCommentHeader = <ReplayComment key={`commentReplayHeaders.length${commentPost.createdAt}_${user.username}to${commentPost.user_id.username}`} post= {post} comments={commentPost} handleAddLike={handleAddLikeComment} navigation={navigation} CommentNavigate={CommentNavigate} handleCloseModal={handleCloseModal} ChatNavigate={ChatNavigate} like={commentPost.likes.some(like => like === user._id)} Color={Color} setReplayTo={setReplayTo} PostCommentInput={PostCommentInput}/>;
    setReplies(prevCommentHeaders => [newCommentHeader,...prevCommentHeaders]);
  
  };

  useEffect(() => {
    if(showMyComments && showMyComments.length > 0){
      showMyComments.map((comment) => {
        addFirstNewReplay(comment)
      })
    }
  },[showMyComments])
  const handleShowMoreReplies = async() => {
    if(loadMoreReplies) return
    try{
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/LoadMoreReplies`, {
        method: "post",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentsId: post._id,
          excludeReplies : [...repliesID , ...hideID]
        })
      })
      const data = await response.json()
      if(data.error) return
      data.replies.map((replay) => {
        setRepliedId(prev => [...prev,replay._id])
        addNewReplay(replay)
      })
      // addNewComment(data.comments[0]);
    }
    catch(e){
      console.log('error while loading more comments ',e)
    }
    finally{
      setLoadMoreReplies(false)
    }
  }

  async function handleAddLikeComment(comment,setCommentLike,setCommentLikeCount) {
    const fetchAddLike = await fetch(`${EXPO_PUBLIC_API_URL}/AddLikeToCommentOrReply`,{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        commentId: post._id,
        replyId: comment._id,
        userId:user._id
      })
    })

    const data = await fetchAddLike.json()
    if(data.error) return
    if(data.likeStatus === 'removed'){
      setCommentLikeCount((prev) => prev-=1)
      setCommentLike(false)
      setReplies && setReplies(prev => prev.map((_post) => {
        if(_post._id === data.comment._id) return data.comment
        return _post
      }
      ))
    }

    if(data.likeStatus === 'added'){
      setCommentLikeCount((prev) => prev+=1)
      setCommentLike(true)
      setReplies && setReplies(prev => prev.map((_post) => {
        if(_post._id === data.comment._id) return data.comment
        return _post
      }
      ))
    }
  }
    
  return (
    <CommentsAllContainer>
    <CommentsHeader>
   <CommentsHeaderAuthor>
    <TouchableOpacity activeOpacity={.9} onPress={() => {
                  handleCloseModal()
                  navigation.push(CommentNavigate, {
                    username: post.user_id.username,
                    back:true,
                    ChatNavigate:ChatNavigate,
                    CommentNavigate:CommentNavigate
                }); 
        }}>
        <AuthorIcon src={`${EXPO_PUBLIC_API_URL}/uploads/${post.user_id.profile_img}`} alt="Author Icon"/> 
    </TouchableOpacity>
     
     <View style={{display:'flex',width:'85%'}}>
     <TouchableOpacity activeOpacity={.9} onPress={() => {
                handleCloseModal()
                navigation.push(CommentNavigate, {
                  username: post.user_id.username,
                  back:true,
                  ChatNavigate:ChatNavigate,
                  CommentNavigate:CommentNavigate
              }); 
        }}>
      <AuthorName style={{color:Color.TEXT}}>{post.user_id.username}</AuthorName>
     </TouchableOpacity>
     <AuthorContent>
           <ReadMore text={post.content} color={Color.TEXT}> </ReadMore>
      </AuthorContent>
     </View>
     
   </CommentsHeaderAuthor>
   <TouchableOpacity onPress={() => {handleAddLike(post,setCommentLikeCount)}}>
          {commentLikesCount ? <AntDesign name="heart" size={20} color="red" /> :  <Feather name="heart" size={20} color={Color.TEXT}/> }
    </TouchableOpacity>
 </CommentsHeader>

     <BottomContainerComment>
             <DataComment style={{color:Color.TEXT}}>{CalcData(post.createdAt)}</DataComment>
             {post.likesCount > 0 &&  <TranslateSpan style={{color:Color.TEXT}}>{post.likesCount} {post.likesCount > 1 ? 'likes' : 'like'}</TranslateSpan>}
             <TouchableOpacity opacity={.8} onPress={() => {setReplayTo({comment : post , replayTo:post.user_id});setTimeout(() => { PostCommentInput.current?.focus()},300)}}>
                 <TranslateSpan style={{color:Color.TEXT}}>Reply</TranslateSpan>
             </TouchableOpacity>
             {/* <TranslateSpan style={{color:Color.TEXT}}>See translation</TranslateSpan> */}
       </BottomContainerComment>
       {post.replies.length > 0 && replies.length > 0 && 
       <View style={{marginTop:15}}>
        {replies}

       </View>
       }

       {post.replies && (post.replies.length - replies.length) > 0  ?
        <TouchableOpacity onPress={() => {[handleShowMoreReplies(),setLoadMoreReplies(true)]}}>
            <Text style={{color:Color.TEXT,marginLeft:58,marginTop:10,fontWeight:'bold',fontSize:12}}>Show more {post.replies.length - replies.length} comments</Text>
       </TouchableOpacity>
       :
       post.replies && post.replies.length > 0 &&
       <TouchableOpacity onPress={() => { setReplies([]);setRepliedId([]) }}>
        <Text style={{color:Color.TEXT,marginLeft:58,marginTop:10,fontWeight:'bold',fontSize:12}}>hide All </Text>
    </TouchableOpacity>
       }
 </CommentsAllContainer>
  );

}


const ContainerPreviewAdd = ({post,like,handleAddLikeComment,Color}) => {
  const LikeRef = useRef()
  // console.log('post like',post.likesCount)
  const [commentLikesCount,setCommentLikeCount] = useState(like)
    return <ContainerCommentsPrevire style={{backgroundColor:Color.SECONDARY_BACKGROUND}}>
        <CommentsPreviewLeft>
        <CommentPreviewImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${post.user_id.profile_img}`}}/>
        <CommentsPreviewName style={{color:Color.TEXT}}>{post.user_id.username}</CommentsPreviewName>
        <View style={{flex:1,pointerEvents:'none'}}>
          <SmartReadMore text={post.content} maxRows = {1} maxCharacters ={27} showReadMore={false} color={Color.TEXT}></SmartReadMore>
        </View>
       
        
        </CommentsPreviewLeft>
        <TouchableOpacity onPress={() => {handleAddLikeComment(post,setCommentLikeCount)}}>
        {like ? <AntDesign name="heart" size={20} color="red" /> :  <Feather name="heart" size={20} color={Color.TEXT}/> }
        </TouchableOpacity>
        
        {/* <IconHeart onClick={() => handleAddLikeComment(post,LikeRef)} $like={like}  ref={LikeRef} className="mif-heart"/> */}
    </ContainerCommentsPrevire>
}

const AnimiatedImage = Animated.createAnimatedComponent(Image)

const PostComponents = memo(({post,like,setViewedPosts,setPosts,CommentNavigate = 'Profile',ChatNavigate='ChatScreen',isViewable=true,setIsModalOpen,isModalOpen}) => {

  const route = useRoute()
  const user = useSelector(selectCurrentUser);
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const [islike, setIsLike] = useState(like);
  const bottomSheetModelRef = useRef()
  const snapPoints = ['65%' ] //95
  const AllCommentsRef = useRef();
  const [commentHeaders, setCommentHeaders] = useState([]);
  const PostComment = useRef()
  const PostCommentInput = useRef()
  const [pause,setPause] = useState(false)
  const [mute,setMute] = useState(false)
  const videoRefs = useRef([]); // Array to store refs for multiple videos
  const [commentInput,setCommentInput] = useState('')
  const isFocused = useIsFocused(); // Hook to detect if screen is focused
  const loadingCommentRef = useRef(false); // UseRef for tracking loading state
  const [loadComments, setLoadComments] = useState(false)
  const totalVisibleTimeRef = useRef(0); // Ref to track total visible time
  const visibilityStartTimeRef = useRef(null); // Ref to track start time when element becomes visible
  const intervalRef = useRef(null); // Ref to hold interval ID
  const isLongViewed = useRef(false); // Ref to indicate if visible time exceeds 3 seconds
  const [replayTo , setReplayTo] = useState(null)
  const ws = useSelector(selectCurrentWs);
  const typePost = post.typePost || 'post'
  const isDarkMode = useSelector(selectCurrentTheme)
  const Color = getTheme(isDarkMode); // Get the theme based on the mode
  const [selectedIndex, setSelectedIndex] = useState(post.selectedIndex)

  const [myComments , setMyComments] = useState([])
  function handlePresentModal(){
    bottomSheetModelRef.current?.present()
    loadingCommentRef.current = false
    FetchMoreComments()
    setIsModalOpen(true);
  }
  function handleCloseModal(){
    bottomSheetModelRef.current?.close()
    setMyComments([])
    setReplayTo(null)
    setCommentHeaders([])
    setIsModalOpen(false);
  }
  useEffect(() => {
    if (!isModalOpen) {
      handleCloseModal();
    }
  },[isModalOpen])

    useEffect(() => {
    if (videoRefs.current[currentIndex]) {
      if (pause) {
        videoRefs.current[currentIndex].setStatusAsync({ shouldPlay: false })
      } else {
        videoRefs.current[currentIndex].setStatusAsync({ shouldPlay: true })
      }
    }
  }, [pause, currentIndex]);

  useEffect(() => {
    if(isFocused === false){
      setPause(true)
    }
  },[isFocused])


  const handleViewPost = (userId,postId) => {
    if (ws.currentWs && ws.currentWs.readyState === WebSocket.OPEN) 
      ws.currentWs.send(JSON.stringify({type:'update-view', payload:{userId,postId}}))
  }

  useEffect(() => {
    if (isViewable) {
      setPause(false);  
      if (visibilityStartTimeRef.current === null) {
        visibilityStartTimeRef.current = Date.now();
      }

      if (intervalRef.current === null) {
        intervalRef.current = setInterval(() => {
          totalVisibleTimeRef.current += 1; // Increment ref value

          if (totalVisibleTimeRef.current > 3 && !isLongViewed.current) {
            isLongViewed.current = true;
            console.log('Element has been visible for more than 3 seconds');
            // setViewedPosts && setViewedPosts(prev => ({
            //   ...prev,
            //   [post._id]: true,
            // }));
            handleViewPost(post.author._id,post._id)
            clearInterval(intervalRef.current); // Clear the interval
            intervalRef.current = null;
          }
        }, 1000);
      }
    } else {
      setPause(true);

      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;

        if (visibilityStartTimeRef.current !== null) {
          const visibilityDuration = (Date.now() - visibilityStartTimeRef.current) / 1000; // Convert ms to seconds
          totalVisibleTimeRef.current += visibilityDuration;

          if (totalVisibleTimeRef.current > 3 && !isLongViewed.current) {
            isLongViewed.current = true
            // setViewedPosts && setViewedPosts(prev => ({
            //   ...prev,
            //   [post._id]: true,
            // }));
            handleViewPost(post.author._id,post._id)
          }
          visibilityStartTimeRef.current = null; // Reset the start time
        }
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isViewable]);

const addNewComment = (commentPost) => {
  const newCommentHeader = <CommentHeaderComponent key={`commentHeaders.length${commentPost.createdAt}_${user.username}`} post={commentPost} user={user} handleAddLike={handleAddLikeComment} navigation={navigation} CommentNavigate={CommentNavigate} handleCloseModal={handleCloseModal} ChatNavigate={ChatNavigate} like={commentPost.likes.some(like => like._id === user._id)} Color={Color} setReplayTo={setReplayTo} PostCommentInput={PostCommentInput}/>;
  setCommentHeaders(prevCommentHeaders => [newCommentHeader,...prevCommentHeaders]);

};



const addMoreComment = (commentPost, ShowComment) => {

  if(ShowComment ){
    setMyComments((prev) => [...prev , ShowComment._id])
  }
  // Create a new comment header component
  const newCommentHeader = (
    <CommentHeaderComponent
      key={`commentHeaders.length${commentPost.createdAt}_${user.username}`}
      post={commentPost}
      user={user}
      handleAddLike={handleAddLikeComment}
      navigation={navigation}
      CommentNavigate={CommentNavigate}
      handleCloseModal={handleCloseModal}
      ChatNavigate={ChatNavigate}
      like={commentPost.likes.some(like => like._id === user._id)}
      Color={Color}
      setReplayTo={setReplayTo}
      PostCommentInput={PostCommentInput}
      showMyComments = {ShowComment ?  [ShowComment] : null}
      hideID = {ShowComment ? [...myComments,ShowComment._id] : []}

    />
  );

  // Update commentHeaders state
  setCommentHeaders(prevCommentHeaders => {
    const existingCommentIndex = prevCommentHeaders.findIndex(comment => comment.key === `commentHeaders.length${commentPost.createdAt}_${user.username}`);
    
    if (existingCommentIndex !== -1) {
      // Replace the existing comment header
      const updatedHeaders = [...prevCommentHeaders];
      updatedHeaders[existingCommentIndex] = newCommentHeader;
      return updatedHeaders;
    } else {
      // Add the new comment header
      return [...prevCommentHeaders, newCommentHeader];
    }
  });
};



const handleAddReplay = async() => {
  try {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}/addReplay`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        commentsId: replayTo.comment._id,
        comment: PostCommentInput.current.value,
        replayTo_id : replayTo.replayTo._id,
        postId:post._id
      })
    });

    const data = await response.json();
    post.commentsCount ++;
    addMoreComment(data.comment , data.myComment)
    PostCommentInput.current.value =''
    setReplayTo(null)
    
    } catch (error) {
      console.error('Error posting comment:', error);
    }
}
  const FetchAddComment = async() => {
    if(PostCommentInput.current.value.length <= 0){
      return Alert.alert('cant post Empty comment')
    }
    if(PostCommentInput.current.value.length > 400){
      return  Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Cannot be more than 400 characters',
        visibilityTime: 2000, // Show the toast for 2 seconds
      });
    }
    if(replayTo) {
      handleAddReplay() 
      return
    }
    try {
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/addComment`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          postId: post._id,
          content: PostCommentInput.current.value
        })
      });

      const data = await response.json();
      if (data !== 'error') {
        // Assuming the server returns the updated post object with the new comment
        post.commentsCount = data.commentsCount;

        setPosts(prev => prev.map((_post) => {
          if(_post._id === data._id) return {...data,selectedIndex :_post.selectedIndex}
          return _post
        }))
        addNewComment(data.comments[0]);
        setReplayTo(null)
      PostCommentInput.current.value =''
    }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  }

  async function handleAddLikeComment(comment,setCommentLikeCount) {
    const fetchAddLike = await fetch(`${EXPO_PUBLIC_API_URL}/addLikeToComment`,{
      method:"POST",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        commentId: comment._id,
        userId: user._id,
        postId:post._id
      })
    })

    const data = await fetchAddLike.json()
    if(data.remove){
      setCommentLikeCount((prev) => prev-=1)
      setPosts && setPosts(prev => prev.map((_post) => {
        if(_post._id === data.remove._id) return {...data.remove,selectedIndex :_post.selectedIndex}
        return _post
      }
      ))
    }

    if(data.add){
      setCommentLikeCount((prev) => prev+=1)
       setPosts && setPosts(prev => prev.map((_post) => {
        if(_post._id === data.add._id) return {...data.add,selectedIndex :_post.selectedIndex}
        return _post
      }
      ))
    }
  }

  const addLike = (post) => {
    fetch(`${EXPO_PUBLIC_API_URL}/addLike`, {
      method: "post",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        postId: post._id,
      }),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data === "error") {
          console.log("error when liked a post");
        } else {
          //setLike([...like, post]) set all likes
          // post.likesCount += 1;
          // setLike(true);
          // console.log('add like')
          if(data.removeLike)
            {
              post.likesCount = data.removeLike.likesCount;
              setIsLike(false);
              setPosts && setPosts(prev => prev.map((_post) => {
                if(_post._id === data.removeLike._id) return {...data.removeLike,selectedIndex :_post.selectedIndex}
                return _post
              }))
            }
            else if(data.addLike)
              {
                post.likesCount = data.addLike.likesCount;
                setIsLike(true);
                setPosts && setPosts(prev => prev.map((_post) => {
                  if(_post._id === data.addLike._id) return {...data.addLike,selectedIndex :_post.selectedIndex}
                  return _post
                }))
              }
         
        }
      });
  };

  // useEffect(() => {
  //   // Initialize with existing comments when the post or display changes
  //   if (post.comments.length > 0) {
  //     const initialComments = post.comments.map((comment) => (
  //       <CommentHeaderComponent key={comment._id} post={comment} user={user} handleAddLike={handleAddLikeComment} navigation={navigation} CommentNavigate={CommentNavigate} handleCloseModal={handleCloseModal} ChatNavigate={ChatNavigate} like={comment.likes.some(like => like._id === user._id)}/>
  //     ));
  //     setCommentHeaders(initialComments);
  //   }
  // }, [post.comments]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // Prepare data for FlatList
  const data = post.post_imgs.map((img, _idx) => {
    if (img.type.split('/')[0] === 'video') {
      // Flatten into two items: icon and image, with unique keys
      return { key: `icon-${_idx}`, type: 'icon', uri: img.data, cover:post.thumbnail };
    } else {
      return { key: `image-${_idx}`, type: 'image', uri: img.data };
    }
  });
  const doubleTapRef = useRef();

  const handleSingleTap = () => {
    // Alert.alert(`Single tap on item ${index}`);
    // Handle single tap action (e.g., pause video)
      if (videoRefs.current[currentIndex]) {
        setPause(prev => !prev)
      }
  };
  // const handleDoubleTap = () => {
  //   addLike(post)
  //   // Handle double tap action (e.g., like video)
  // };
  const isAnimating = useRef(false);

  const handleDoubleTap = () => {
    if (isAnimating.current) {
      return; // Do nothing if the animation is already running
    }
    isAnimating.current = true;

    scale.value = withSpring(1,undefined, (isFinished) =>{ 
      if(isFinished) {
        scale.value = withDelay(800, withTiming(0, { duration: 0 }));
      }
    })
    translateY.value = withDelay(
      600, // Delay of 600ms
      withTiming(-Dimensions.get('window').height / 2, { duration: 1000 }, (isFinished) => {
        if (isFinished) {
          translateY.value = withTiming(0, { duration: 0 });
        }
      })
    );
    if(!islike)
      addLike(post)
    Vibration.vibrate(100);

    setTimeout(() =>{
      isAnimating.current = false; // Animation completed, reset the flag
    },1800)
  }

 // Render each item based on its type
 const renderItem = ({ item ,index}) => {
  // console.log(`${process.env.EXPO_PUBLIC_API_URL}/uploads/${item.uri}`)
    if (item.type === 'icon') {
      // const videoData = item.uri.split(',')[1];
      // const uri = `data:video/mp4;base64,${videoData}`;
      return <View style={styles.iconContainer}>
              {pause &&
               <DropShadow style={[{shadowColor: "#000", shadowOffset: {width: 0,height: 0,},shadowOpacity: 1,shadowRadius: 5, },styles.iconPause]}>
                <Icon name={'play-outline'} size={100} color={'#fff'}/></DropShadow>} 
              <Video
                    // shouldPlay={false} // Should play when not paused
                    isLooping
                    onError={(error) => console.error('Failed to load video', error)}
                    isMuted={mute}
                      resizeMode='cover'
                      source={{uri: `${EXPO_PUBLIC_API_URL}/uploads/${item.uri}` }}
                      style={styles.image}
                      ref={ref => (videoRefs.current[index] = ref)} // Store ref in array
                      onPlaybackStatusUpdate={status => {
                      if (status.isPlaying) {
                          // Ensure other videos are paused
                          videoRefs.current.forEach((ref, i) => {
                            if (i !== currentIndex) {
                              ref?.setStatusAsync({ shouldPlay: false })
                            }
                          });
                        }
                      }}
                />
                      {/* <Image style={styles.image} source={{ uri: `http://your-server-address/uploads/${item.uri}` }}/>  */}
                   
            </View>
    }
    return( 
            <View activeOpacity={1} style={[{position:'relative'},styled.image]}>
              <ImageZoom
                style={styles.image}
                source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${item.uri}` }}
                onError={(error) => console.error('Failed to load image', error)}
              />
          </View>
      
    )
  };
  const ITEM_WIDTH = Dimensions.get('window').width; // 80% of screen width
  const handleChangeText = (text) => {
    if(text.length > 400){
       Toast.show({
        type: 'error', // 'success', 'error', 'info', or 'custom'
        text1: 'Error',
        text2: 'Cannot be more than 400 characters',
        visibilityTime: 500, // Duration for the toast
      });
    }


    PostCommentInput.current.value = text;
    if(text.length <=0)
      {
        PostComment.current.setNativeProps({
          style:{display:'none'}
        })
      }else{
        PostComment.current.setNativeProps({
          style:{display:'block'}
        })
      }
      
  }

  // Animated Hearth //

  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);

  const rStyle = useAnimatedStyle(() => ({
    transform:[
      {scale:Math.max(scale.value,0)},
      { translateY: translateY.value },
    ]
  }))

  const FetchMoreComments = async() => {
    if(loadingCommentRef.current) return
    if(commentHeaders.length <= 0)
      setLoadComments(true)
    loadingCommentRef.current = true;
    try{
      console.log('load more comments now ',commentHeaders.length)
      const response = await fetch(`${EXPO_PUBLIC_API_URL}/LoadMoreComments`, {
        method: "post",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postID: post._id,
          commentsSkip: commentHeaders.length
        })
      })
      const data = await response.json()
      data.comments.map((comment) => {
        addMoreComment(comment);
      })
      setTimeout(() => {
        if(data.comments.length < 15){
          console.log('load all')
          loadingCommentRef.current = true;
        }
        else{
          loadingCommentRef.current = false;
        }
      },500)
     
    }
    catch(e){
      console.log('error while loading more comments ',e)
      setTimeout(() => {
        loadingCommentRef.current = false;
      },500)
    }
    finally{
      setLoadComments(false)
    }
  }
  const handleScroll = ({ nativeEvent }) => {
    if (isCloseToBottom(nativeEvent) && !loadingCommentRef.current) {
      FetchMoreComments()
    }
  };


  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 200;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };
  return (
        <View style={{marginBottom:30}}>
            {post.post_imgs && post.post_imgs.length > 0 && (
        <View style={{ width: '100%'}}>
            <TouchableOpacity style={styles.PostTopLayoutContainer} activeOpacity={.9} onPress={() => {
               navigation.push(CommentNavigate, {
                username: post.username,
                back:true,
                ChatNavigate:ChatNavigate,
                CommentNavigate:CommentNavigate
            }); 
            }}>
                <View style={styles.PostTopLayoutImage}>
                    <ProfileImage user={post.author} size={30} outlineSize={35} />
                </View>
                  <Text style={[styles.PostTopLayoutName,{color:Color.TEXT}]}>{post.username}</Text>
               <View style={[styles.PostTopLayoutDotDay, {backgroundColor:Color.GrayBackground,}]}></View>
               <Text style={[styles.PostTopLayoutDay,{color:Color.TEXT}]}>{CalcData(post.createdAt)}</Text>
            </TouchableOpacity>
           
            <View style={styles.PostImgContainer}>
              {typePost === 'picks' ? 
              <View>
                
               <FlatList
  data={post.post_imgs}
  renderItem={({ item, index }) => {
    const isBottomImage = (post.post_imgs.length === 3 && index === 2) || 
                          (post.post_imgs.length === 5 && index === 4);

    return (
      <View
        style={[
          picksStyles.picksGridItem,
          post.post_imgs.length === 2 && picksStyles.picksTwoItemsGridItem, // Style for 2 items
          isBottomImage && picksStyles.picksBottomImage, // Style for the bottom image when there are 3 or 5 items
        ]}
      >
        <TouchableOpacity onPress={() => { navigation.navigate('PreviewFile', { item: item, username: post.author.username }) }}>
          <Image
            source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${item.data}` }}
            style={[
              picksStyles.picksImage,
            ]}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    );
  }}
  keyExtractor={(item, index) => index.toString()}
  numColumns={2} // Two items per row
  key={'_'} // Optional: A unique key to force re-rendering if necessary
  columnWrapperStyle={picksStyles.picksRow} // Styling for the row wrapper
  contentContainerStyle={picksStyles.picksFlatListContent} // Adjust content container style
/>
              </View> 
              :
              <View>
              <TapGestureHandler waitFor={doubleTapRef} onActivated={() => handleSingleTap()}>
            <TapGestureHandler ref={doubleTapRef} numberOfTaps={2} onActivated={() => handleDoubleTap()}> 
            <FlatList
                   ref={flatListRef}
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.key}
                    horizontal={true} // Enable horizontal scrolling
                    showsHorizontalScrollIndicator={false} // Hide the horizontal scroll indicator
                    snapToInterval={ITEM_WIDTH} // Width of each item + margin
                    decelerationRate="fast" // Faster deceleration
                    snapToAlignment="center" // Align snap to the center of the view
                    contentContainerStyle={styles.flatListContent} // Adjust content container style
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewConfig}
                />
                </TapGestureHandler>
                </TapGestureHandler>
                {(post.post_imgs.length > 1) && 
                            <View style={styles.dotContainer}>
                <AnimatedDotsCarousel
                length={post.post_imgs.length}
                currentIndex={currentIndex}
                maxIndicators={4}
                interpolateOpacityAndColor={true}
                activeIndicatorConfig={{
                  color: Color.PRIMARY_BUTTON,
                  margin: 3,
                  opacity: 1,
                  size: 8,
                }}
                inactiveIndicatorConfig={{
                  color: 'white',
                  margin: 3,
                  opacity: 0.5,
                  size: 8,
                }}
                decreasingDots={[
                  {
                    config: { color: 'white', margin: 3, opacity: 0.5, size: 6 },
                    quantity: 1,
                  },
                  {
                    config: { color: 'white', margin: 3, opacity: 0.5, size: 4 },
                    quantity: 1,
                  },
                ]}
              />                
                </View>}
                </View>
                
              
              }
            
                 <View style={{position:'absolute',right:0,bottom:(post.post_imgs[currentIndex].type.split('/')[0] === 'image' ? 180 : 215),width:50,height:50,display:'flex',justifyContent:'center',alignItems:'center'}}>
                 
                 {typePost !== 'picks' &&

                <TouchableOpacity onPress={() => addLike(post)}>
               <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >
                  <View style={{display:'flex',alignItems:'center',gap:3}}>
                  {islike ? <AntDesign name="heart" size={30} color="red" /> :  <AntDesign name="heart" size={30} color="#fff" />}

                  <Text style={styles.likesText}>
                    {post.likesCount === 0
                      ? '0'
                      : post.likesCount}
                  </Text>
                  </View> 

                </DropShadow>
                </TouchableOpacity>
}
                  </View>
                  {typePost !== 'picks' &&
                  <View style={{position:'absolute',right:0,bottom:(post.post_imgs[currentIndex].type.split('/')[0] === 'image' ? 120 : 155),width:50,height:50,display:'flex',justifyContent:'center',alignItems:'center'}}>
                            <TouchableOpacity onPress={() => {handlePresentModal()}}>
                            <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >                         
                     <View style={{display:'flex',alignItems:'center',gap:3}}>
                                <Image style={{width:30,height:30,transform: [{ scaleX: -1 }]}} source={require('../../assets/chat-balloon.png')}/>
                                  {/* <FontAwesome style={{transform:[{scaleX:-1}]}} name="comment-o" size={30} color="#fff" /> */}
                                  <Text style={styles.likesText}>
                                    {post.commentsCount}
                                  </Text>
                              </View>
                                  </DropShadow>
                            </TouchableOpacity>
                  </View>
                  }
                   {typePost !== 'picks' &&
                  <View style={{position:'absolute',right:0,bottom:(post.post_imgs[currentIndex].type.split('/')[0] === 'image' ? 70 : 105),width:50,height:50,display:'flex',justifyContent:'center',alignItems:'center'}}>
                         <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >                     
                            <View style={{display:'flex',alignItems:'center',gap:3}}>

                            <Feather name="send" size={30} color="#fff" />
                            <Text style={styles.likesText}>
                                      {post.saves}
                          </Text>
                            </View>
                            </DropShadow>
                  </View>
}
{typePost !== 'picks' &&
                  <View style={{position:'absolute',right:0,bottom: (post.post_imgs[currentIndex].type.split('/')[0] === 'image' ? 15 : 50),width:50,height:50,display:'flex',justifyContent:'center',alignItems:'center'}}>
                         <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >                        
                <View style={{display:'flex',alignItems:'center',gap:3}}>

                          <FontAwesome name="bookmark-o" size={30} color="#fff" />
                          <Text style={styles.likesText}>
                                      {post.saves}
                          </Text>
                      </View>
                          </DropShadow>
                  </View>
}
{typePost !== 'picks' &&
                         <DropShadow
                         style={{
                           shadowColor: "#000",
                           shadowOffset: {
                             width: 0,
                             height: 0,
                           },
                           shadowOpacity: 1,
                           shadowRadius: 5,
                         }}
                       >
                        <View style={{position:'absolute',left:0,bottom:15,width:'auto',maxWidth:Dimensions.get('window').width -80,height:'auto',maxHeight:200,display:'flex',justifyContent:'center',padding:10}}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.push(CommentNavigate, {
                            username: post.username,
                            back:true,
                            ChatNavigate:ChatNavigate,
                            CommentNavigate:CommentNavigate
                        });
                        }}
                        style={styles.usernameContainer}
                      >
                        <Text style={styles.username}>{post.username}</Text>
                      </TouchableOpacity>
                      <ScrollView style={styles.contentWrapper}>
                        <SmartReadMore text={post.content}/>
                      </ScrollView>
                    </View>
                  
                    </DropShadow>
}

                      <Animated.View style={{pointerEvents:'none', position:'absolute',width:Dimensions.get('window').width,height:500,display:'flex',justifyContent:'center',alignItems:'center'}}>
                      <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >
                                <AnimiatedImage style={[{tintColor:'red', width:150,height:150,transform: [{ scaleX: -1 }]},rStyle]} source={require('../../assets/like.png')}/>
                              </DropShadow>
                      </Animated.View>
                      {videoRefs.current[currentIndex] && 
                       <TouchableOpacity onPress={() => {setMute(prev => !prev)}}  style={{position:'absolute',right:10,bottom:10,width:50,height:50,display:'flex',justifyContent:'center',alignItems:'center', backgroundColor:Color.BLACK,width:30,height:30,borderRadius:50}}>
                            <Entypo
                                name={mute ? 'sound-mute' : 'sound'}
                                size={15}
                                color={Color.WHITE}
                            />
                        </TouchableOpacity>
                      }
                          
            </View>
          
            {typePost === 'picks' &&
         <View style={{display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginHorizontal:10,marginBottom:10,marginTop:10}}>
           <View style={{display:'flex',flexDirection:'row',gap:20}}>

           <TouchableOpacity onPress={() => addLike(post)}>
           <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >
                  <View style={{display:'flex',alignItems:'center',gap:3}}>
                  {islike ? <AntDesign name="heart" size={30} color="red" /> :  <AntDesign name="heart" size={30} color="#fff" />}

                  <Text style={styles.likesText}>
                    {post.likesCount === 0
                      ? '0'
                      : post.likesCount}
                  </Text>
                  </View> 

                </DropShadow>
                </TouchableOpacity>
                 <View style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                         <TouchableOpacity onPress={() => {handlePresentModal()}}>
                         <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >
                         <View style={{display:'flex',alignItems:'center',gap:3}}>
                             <Image style={{width:30,height:30,transform: [{ scaleX: -1 }]}} source={require('../../assets/chat-balloon.png')}/>
                               {/* <FontAwesome style={{transform:[{scaleX:-1}]}} name="comment-o" size={30} color="#fff" /> */}
                               <Text style={styles.likesText}>
                                 {post.commentsCount}
                               </Text>
                           </View>
                               </DropShadow>
                         </TouchableOpacity>
               </View>

               <View style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
               <DropShadow
                  style={{
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 0,
                    },
                    shadowOpacity: 1,
                    shadowRadius: 5,
                  }}
                >
                          <View style={{display:'flex',alignItems:'center',gap:3}}>

                                    <Feather name="send" size={30} color="#fff" />
                                    <Text style={styles.likesText}>
                                      {post.saves}
                                    </Text>
                              </View>
                                   </DropShadow>
                         </View>
           </View>

               <View style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
               <DropShadow style={{shadowColor: "#000", shadowOffset: {width: 0,height: 0,},shadowOpacity: 1,shadowRadius: 5, }}>

                      <View style={{display:'flex',alignItems:'center',gap:3}}>

                       <FontAwesome name="bookmark-o" size={30} color="#fff" />
                       <Text style={styles.likesText}>
                                      {post.saves}
                          </Text>
                      </View>
                       </DropShadow>
               </View>
       </View>
       
       }
         {typePost === 'picks' && 
             <DropShadow style={{shadowColor: "#000", shadowOffset: {width: 0,height: 0,},shadowOpacity: 1,shadowRadius: 5, }}>
            <View style={{display:'flex',justifyContent:'center',padding:10,flexDirection:'row',alignItems:'start',gap:10}}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push(CommentNavigate, {
                      username: post.username,
                      back:true,
                      ChatNavigate:ChatNavigate,
                      CommentNavigate:CommentNavigate
                  });
                  }}
                  style={styles.usernameContainer}
                >
                  <Text style={styles.username}>{post.username}</Text>
                </TouchableOpacity>
                <ScrollView style={styles.contentWrapper}>
                  <ReadMore text={post.content}/>
                </ScrollView>
              </View>
            
              </DropShadow>
              }
            {typePost === 'picks' &&
              <PicksComponent post={post} user={user} selectedIndex={selectedIndex} setPosts={setPosts} isViewable={isViewable}/> }

            <View style={styles.postContainer}>
      {/* <TouchableOpacity onPress={() => {handlePresentModal()}}>
      <Text style={{color:'lightgray',marginTop:8,fontSize:12,fontWeight:'bold'}}>view all {post.commentsCount} comments</Text>
       </TouchableOpacity> */}
        {typePost !== 'picks' &&
      <View style={{display:'flex',gap:5,marginTop:10}}>
         {post && (post.comments.length >= 1  && post.comments.length <= 2)&& 
              post.comments.slice(0, post.comments.length).map((comment, index) => (
                <TouchableOpacity onPress={() => {handlePresentModal()}} key={index}>
                   <ContainerPreviewAdd post={comment} handleAddLikeComment={handleAddLikeComment} like={comment.likes.some(like => like._id === user._id)} Color={Color}/>
                  </TouchableOpacity>
              ))
            }
              {post && post.comments.length > 2 && 
              post.comments.slice(0, 2).map((comment, index) => (
                <TouchableOpacity onPress={() => {handlePresentModal()}} key={index}>
                <ContainerPreviewAdd post={comment} handleAddLikeComment={handleAddLikeComment}like={comment.likes.some(like => like._id === user._id)} Color={Color}/>
                  </TouchableOpacity>
              ))
            }
        </View> }

       
       
        
       {/* <Text style={{color:'lightgray',marginTop:5,fontSize:12,fontWeight:'bold'}}>{CalcData(post.createdAt,true)}</Text> */}

    </View>
            
        </View>
        )}
         <BottomSheetModal
                  ref={bottomSheetModelRef}
                  index={0}
                  snapPoints={snapPoints}
                  onDismiss={handleCloseModal}
                  backgroundStyle={{borderRadius:24,backgroundColor:Color.SECONDARY_BACKGROUND}}
                  handleIndicatorStyle={{color:Color.TEXT}}
                  footerComponent={memo((props) => (
                    <BottomSheetFooter {...props}>
                    {replayTo &&
                      <View style={{width:'100%',paddingLeft:60,height:30,backgroundColor:Color.SECONDARY_BACKGROUND,display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                        <Text style={{color:Color.TEXT,fontWeight:'bold'}}>Replying to {replayTo.replayTo.username}</Text>
                        <TouchableOpacity onPress={() => {
                          setReplayTo(null);
                          Keyboard.dismiss()
                          }}>
                            <AntDesign name={'close'} color={Color.TEXT} size={20} />
                        </TouchableOpacity>
                      </View>
                    }
                    
                    <View style={{display:'flex',flexDirection:'row',padding:20,backgroundColor:Color.SECONDARY_BACKGROUND}}>
                      <ExpoImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}`}} style={{width:60,height:45, borderRadius:50,backgroundColor:'transparent',objectFit:'fill'}} />
                      <View style={{flex:1,height:45,color:Color.TEXT,backgroundColor:Color.SECONDARY_BACKGROUND,padding:8,borderRadius:8,borderColor:Color.TEXT,borderWidth:1,borderRadius:24,marginLeft:12,display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                          <BottomSheetTextInput
                          keyboardType='default'
                          style={{fontWeight:'bold',flex:1,color:Color.TEXT}} keyboardAppearance={isDarkMode ? 'dark' : 'light'}  placeholderTextColor={Color.TEXT} 
                          placeholder={`Add a comment for ${post.username}...`}
                          ref={PostCommentInput}
                          onChangeText={handleChangeText}
                          />
                          <TouchableOpacity activeOpacity={.6} onPress={FetchAddComment} ref={PostComment} style={{display:'none'}}>
                            <View style={{borderRadius:50,backgroundColor:Color.PRIMARY_BUTTON,width:45,height:35,display:'flex',justifyContent:'center',alignItems:'center'}}>
                                <Icon name={'arrow-up'} size={30} color={'#fff'} />
                            </View>
                          </TouchableOpacity>
                      </View>
                      
                      </View>
                    </BottomSheetFooter>
                   
                  ))}
                  keyboardBehavior='extend'
                  keyboardBlurBehavior='restore'
                  
                  >
                  <View>
                    <Text style={{fontWeight:'bold',fontSize:20,color:Color.TEXT,textAlign:'center'}}>Comments</Text>
                  </View>
                 <BottomSheetScrollView style={{marginBottom:100}}
                     onScroll={handleScroll}
                     scrollEventThrottle={16}
                 >
                 <AllCommentsContainer ref={AllCommentsRef} $user={user}>
                    {loadComments ?
                      <ActivityIndicator size={50} color="#0000ff" />

                    :
                    commentHeaders.length === 0? (
                      <NoCommentsContainer>
                          <NoCommentsText style={{color:Color.TEXT,fontSize:30,fontWeight:'bold'}}>No comments yet...</NoCommentsText>
                          <Text style={{color:Color.TEXT,fontSize:16,marginTop:15,fontWeight:'600'}}>Be the first to comment</Text>
                      </NoCommentsContainer>
                    ) : (
                      commentHeaders
                    )}
                  </AllCommentsContainer>
                
                 </BottomSheetScrollView>
                 <Toast />
          </BottomSheetModal>

            </View>
           
  )
})

const styles = StyleSheet.create({
    image:{
        width: Dimensions.get('window').width, // Adjust width according to screen size
        height:510,
        borderRadius:8,
        objectFit:'fill',  
    },
    video: {
        width: Dimensions.get('window').width, // Adjust width according to screen size
        height:510,
        borderRadius:8,
        objectFit:'fill'
      }, 
      iconContainer:{
        width: Dimensions.get('window').width, // Adjust width according to screen size
        height:510,
        borderRadius:8,
        position:'relative'
      },
      iconPause:{
        pointerEvents:'none',
        zIndex: 1,
        position:'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -50, // Half of the icon's width
        marginTop: -50, // Half of the icon's height
        
    },
    PostTopLayoutContainer:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'centers',
        gap:10,
        marginBottom:8,
    },
    PostTopLayoutImage:{
        padding:6
    },
    PostTopLayoutName:{
        fontWeight:'bold',
    },
    PostTopLayoutDotDay:{
        height:4,
        width:4,
        borderRadius:50
    },
    PostImgContainer:{
      display:'flex',
      alignContent:'center',
      justifyContent:'center',
    },
    flatListContent: {
        alignItems: 'center',
    },
    dotContainer: {
      position: 'absolute',
      bottom: 10,
      alignItems: 'center',
      justifyContent: 'center',
      width:'100%'
    },
    dot: {
      height: 10,
      width: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    activeDot: {
      backgroundColor: 'blue', // Active dot color
    },
    inactiveDot: {
      backgroundColor: 'gray', // Inactive dot color
    },
    postContainer: {
      marginVertical: 8,
      // marginLeft:15
    },
    likesContainer: {
      marginTop: 8,
    },
    likesText: {
      color: '#fff',
      fontWeight:'400',
      fontSize:12
    },
    contentContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 5,
    },
    usernameContainer: {
      color: 'white',
      fontWeight: 'bold',
      marginTop:-5,
      
    },
    username: {
      color: 'white',
      fontWeight: 'bold',
      fontSize:20,
    },
    contentWrapper: {
      fontWeight: '400',
      overflow: 'hidden',
      flex: 1, // Allow this view to take remaining space
    },
    
});



const picksStyles = StyleSheet.create({
  picksFlatListContent: {
    padding: 10, // Adjust padding as needed
  },
  picksGridItem: {
    flex: 1,
    margin: 5, // Adjust margin to control spacing between items
    aspectRatio: 1, // Standard aspect ratio for square items
  },
  picksTwoItemsGridItem: {
    aspectRatio: 0.75, // Taller items for 2 images
  },
  picksBottomImage: {
    width: '100%', // Full width for the bottom image
    aspectRatio: 1.5, // Smaller aspect ratio to reduce height
    marginTop: 5, // Space above the bottom image
  },
  picksImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  picksTwoItemsImage: {
    aspectRatio: 0.75, // Taller images for 2 items
  },
  picksRow: {
    justifyContent: 'space-between', // Ensures even spacing
  },
});




export default PostComponents
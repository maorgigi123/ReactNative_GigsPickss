import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // Import your preferred icon library
import Octicons from 'react-native-vector-icons/Octicons';
import styled from 'styled-components/native';
import Color from './Colors/Color';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LogBox } from 'react-native';
import ExpoImage from 'expo-image/build/ExpoImage';
import { EXPO_PUBLIC_API_URL } from '@env';
import DropShadow from "react-native-drop-shadow";

const PostsHighlightContainer = styled.View`
  opacity: 1;
  width: 100%;
  height: 100%;
  position: absolute;
`;

const PostsHighlight = styled.View`
  opacity: 0;
  background-color: gray;
  position: absolute;
  width: 100%;
  height: 100%;
`;

const PostInfoContainer = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  visibility: hidden;
  flex-direction: row;
  gap: 20px;
`;
const PostImage = styled.Image`
  object-fit: fill;
  height: 100%;
  width: 100%;
`;

const PostContainer = styled.TouchableOpacity`
  height: 160px;
  width: ${(Dimensions.get('window').width/3)-1}px;
  background-color: black;
  position: relative;
`;

const LikesShow = styled.Text`
  font-size: 1.5em;
`;

const CommentShow = styled.Text`
  font-size: 1.5em;
`;

const TypeOfPost = styled.View`
  position: absolute;
  top: 0;
  padding: 8px;
  right: 0;
`;

const PostContainerVideo = styled.TouchableOpacity`
  height: 280px;
  width: 280px;
  background-size: cover;
  position: relative;
  z-index: 0;
`;

const ProfilePosts = ({ post,posts,index }) => {
  const isVideo = post.post_imgs[0].type.split('/')[0] === 'video';
  const navigation = useNavigation();
  const [Curposts,setPosts] = useState([post])
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state'
  ])

  const HandleShowPreviewPost = () =>{
    navigation.push('FeedProfile', {posts:Curposts,index:index,setPosts:setPosts});
  }
  return (
    <>
      {isVideo ? (
        <PostContainer $image={post.thumbnail} onPress={HandleShowPreviewPost}>
          <ExpoImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${post.thumbnail}`}} style={{objectFit:'fill',height:'100%',width:'100%'}} />
           {/* <PostImage source={{uri:`${process.env.EXPO_PUBLIC_API_URL}/uploads/${post.thumbnail}`}}/> */}
          <PostsHighlightContainer>
            <TypeOfPost>
            <DropShadow style={{shadowColor: "#000", shadowOffset: {width: 0,height: 0,},shadowOpacity: 1,shadowRadius: 5, }}>

            <Octicons name={'video'} size={28} color={Color.WHITE} />
            </DropShadow>
              {/* <svg aria-label="Reels" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                <title>Reels</title>
                <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line>
                <path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                <path d="M9.763 17.664a.908.908 0 0 1-.454-.787V11.63a.909.909 0 0 1 1.364-.788l4.545 2.624a.909.909 0 0 1 0 1.575l-4.545 2.624a.91.91 0 0 1-.91 0Z" fillRule="evenodd"></path>
              </svg> */}
            </TypeOfPost>
            <PostsHighlight />
          </PostsHighlightContainer>
        </PostContainer>
      ) : (
        <PostContainer activeOpacity={.7} onPress={HandleShowPreviewPost}>
          <PostImage source={{uri:`${EXPO_PUBLIC_API_URL}/uploads/${post.post_imgs[0].data}`}}/>
          <PostsHighlightContainer>
            {post.post_imgs.length > 1 && (
              <TypeOfPost>
              <DropShadow style={{shadowColor: "#000", shadowOffset: {width: 0,height: 0,},shadowOpacity: 1,shadowRadius: 5, }}>
                {post.typePost && post.typePost === 'picks' ? 
                   <Octicons name={'multi-select'} size={22} color={Color.WHITE} />
                    :
                    <Icon name={'layers-outline'} size={28} color={Color.WHITE} />
                              }
              </DropShadow>
                {/* <svg aria-label="Carousel" className="x1lliihq x1n2onr6 x1hfr7tm xq3z1fi" fill="currentColor" height="24" role="img" viewBox="0 0 48 48" width="24">
                  <title>Carousel</title>
                  <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path>
                </svg> */}
              </TypeOfPost>
            )}
          </PostsHighlightContainer>
        </PostContainer>
      )}
    </>
  );
};

export default ProfilePosts;

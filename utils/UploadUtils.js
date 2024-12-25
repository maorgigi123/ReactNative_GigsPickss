// UploadUtils.js
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';

export const performUploadTask = async (user, caption, tags, selectedMulti, videoCover, setVideoCover, dispatch, navigation) => {
  const generateThumbnail = async () => {
    let selectedFiles = [];
    try {
      const updatedThumbnails = await Promise.all(
        selectedMulti.map(async (post) => {
          if (post.mediaType === 'video') {
            try {
              const { uri } = await VideoThumbnails.getThumbnailAsync(post.uri, { time: 15000 });
              const base64Video = await FileSystem.readAsStringAsync(post.uri, { encoding: FileSystem.EncodingType.Base64 });
              const base64Thumbnail = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
              selectedFiles.push({ name: post.name, type: post.type, size: 0, data: `data:${post.type};base64,${base64Video}`, thumbnail: `data:image/png;base64,${base64Thumbnail}` });
            } catch (e) {
              console.error('Error generating video thumbnail:', e);
              return null;
            }
          } else {
            try {
              const base64Image = await FileSystem.readAsStringAsync(post.uri, { encoding: FileSystem.EncodingType.Base64 });
              selectedFiles.push({ name: post.name, type: post.type, size: 0, data: `data:${post.type};base64,${base64Image}`, thumbnail: `data:image/png;base64,${base64Image}` });
            } catch (e) {
              console.error('Error converting image to base64:', e);
              return null;
            }
          }
        })
      );
      return selectedFiles;
    } catch (error) {
      console.error('Error in generateThumbnail:', error);
      throw error;
    }
  };

  try {
    const selectedFiles = await generateThumbnail();
    dispatch(setLoadPost({ cover: videoCover ? videoCover : selectedFiles[0].thumbnail, status: true }));
    navigation.navigate('FeedMain');
    const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/uploadPost`, {
      userId: user._id,
      username: user.username,
      content: caption,
      tags: tags,
      images: selectedFiles,
      cover: videoCover ? videoCover : selectedFiles[0].thumbnail,
      folder: user.username,
    });
    setVideoCover(null);
    console.log('File uploaded successfully');
    dispatch(setLoadPost({ cover: '', status: false }));
    navigation.popToTop();
  } catch (e) {
    console.log(e);
    dispatch(setLoadPost({ cover: '', status: false }));
    Alert.alert('Error While Upload.');
  }
};

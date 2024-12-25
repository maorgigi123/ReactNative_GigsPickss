import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage';
const { width } = Dimensions.get('window');

const VideoCoverSelector = ({ videoUri, videoDuration,setVideoCoverEdit,setVideoCover }) => { // Accept videoDuration as a prop
  const [thumbnails, setThumbnails] = useState([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoUri && videoDuration && thumbnails.length <=0) {
      generateThumbnails();
    }
  }, [videoUri, videoDuration]);

  const generateThumbnails = async () => {
    setLoading(true); // Show loader when starting to generate thumbnails
    try {
      if (!videoRef.current || !videoUri || !videoDuration) {
        throw new Error('Video reference, URI, or duration is missing');
      }
  
      const durationSeconds = videoDuration; // Duration in seconds
      const numThumbnails = 10; // Number of thumbnails to generate
      const intervalSeconds = durationSeconds / numThumbnails; // Interval in seconds
      const intervalMillis = Math.floor(intervalSeconds * 1000); // Convert interval to milliseconds and round to integer
  
      if (isNaN(intervalMillis) || intervalMillis <= 0) {
        throw new Error('Invalid interval calculated');
      }
  
      // console.log(`Duration (seconds): ${durationSeconds}`);
      // console.log(`Interval (seconds): ${intervalSeconds}`);
      // console.log(`Interval (milliseconds): ${intervalMillis}`);
  
      const thumbnailPromises = [];
      for (let i = 0; i < numThumbnails; i++) {
        const timeInSeconds = i * intervalSeconds;
        const timeInMilliseconds = Math.floor(timeInSeconds * 1000); // Convert seconds to milliseconds and round to integer
  
        if (isNaN(timeInMilliseconds) || timeInMilliseconds < 0 || timeInMilliseconds > durationSeconds * 1000) {
          console.warn(`Skipping invalid time: ${timeInMilliseconds}`);
          continue;
        }
  
        // console.log(`Generating thumbnail for time: ${timeInMilliseconds}`); // Debugging line
        thumbnailPromises.push(
          VideoThumbnails.getThumbnailAsync(videoUri, { time: timeInMilliseconds })
        );
      }
  
      if (thumbnailPromises.length === 0) {
        throw new Error('No valid thumbnail promises were created');
      }
  
      const thumbnailResults = await Promise.all(thumbnailPromises);
  
      const base64Thumbnails = await Promise.all(
        thumbnailResults.map(async (thumbnail) => {
          if (!thumbnail.uri) {
            throw new Error('Thumbnail URI is missing');
          }
          const base64Image = await FileSystem.readAsStringAsync(thumbnail.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return `data:image/png;base64,${base64Image}`;
        })
      );
  
      setThumbnails(base64Thumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    } finally {
      setLoading(false); // Hide loader when done
    }
  };
  

  const handleThumbnailPress = (index) => {
    console.log('update to index ',index)
    setVideoCover(thumbnails[index])
    setVideoCoverEdit(thumbnails[index])
    setSelectedThumbnailIndex(index); // Update selected thumbnail index
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.video}
        shouldPlay={false}
        resizeMode="contain"
      />
      {loading ? (
        <ActivityIndicator size={50} color="#0000ff" />        // Show loader while thumbnails are being generated
      ) : (
        <ScrollView
          horizontal
          contentContainerStyle={styles.thumbnailsContainer}
        >
          {thumbnails.map((thumbnail, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleThumbnailPress(index)}
              style={[
                styles.thumbnailWrapper,
                selectedThumbnailIndex === index && styles.selectedThumbnailWrapper // Apply border if selected
              ]}
            >
              <ExpoImage source={{ uri: thumbnail }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {/* {selectedThumbnailIndex !== null && (
        <View style={styles.selectedThumbnailContainer}>
          <Text>Selected Thumbnail:</Text>
          <Image source={{ uri: thumbnails[selectedThumbnailIndex] }} style={styles.selectedThumbnail} />
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom:120
  },
  video: {
    width: width,
    height: 0,
  },
  thumbnailsContainer: {
    minWidth: width,
    height: 205,
  },
  thumbnailWrapper: {
    marginHorizontal: 5,
  },
  selectedThumbnailWrapper: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  thumbnail: {
    width: 200,
    height: 200,
  }
});

export default VideoCoverSelector;

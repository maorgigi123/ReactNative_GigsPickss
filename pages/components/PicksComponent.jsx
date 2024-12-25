import { View, Text, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentTheme } from '../../store/user/user.selector';
import { getTheme } from '../Colors/Color';
import { SimpleLineIcons } from 'react-native-vector-icons';
import { EXPO_PUBLIC_API_URL } from '@env';
export default function PicksComponent({ post, user, selectedIndex, setPosts, isViewable }) {
  const width = Dimensions.get('screen').width;
  const isDarkMode = useSelector(selectCurrentTheme);
  const Color = getTheme(isDarkMode); // Get the theme based on the mode
  const [selectedId, setSelectedId] = useState(selectedIndex === -1 ? null : selectedIndex);

  // Initialize Animated.Values for each progress bar
  const animatedWidths = useRef(post.post_imgs.map(() => new Animated.Value(0))).current;

  const getPrecentes = (index) => {
    if (selectedId === null) return 0;

    // Find the selected image object
    const selectedImage = post.selectedImages.find(selected => selected.imageIndex === index);

    // Calculate the percentage if the selected image is found and totalSelections is not zero
    if (selectedImage && post.totalSelections > 0) {
      return (selectedImage.users.length / post.totalSelections) * 100;
    }

    // Return 0 if no image is selected or totalSelections is zero
    return 0;
  };

  // Reset or animate the progress bars based on the visibility of the component
  useEffect(() => {
    post.post_imgs.forEach((_, index) => {
      const newPercentage = isViewable ? getPrecentes(index) : 0;
      Animated.timing(animatedWidths[index], {
        toValue: newPercentage,
        duration: 1000, // Duration of the animation
        useNativeDriver: false,
      }).start();
    });
  }, [isViewable, selectedId, post.totalSelections]);

  const handleSendPick = async (index) => {
    try {
      const fetchPick = await fetch(`${EXPO_PUBLIC_API_URL}/Picks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          indexImage: index,
          userId: user._id,
        }),
      });
      const data = await fetchPick.json();
      if (data.error) {
        console.log('Error while sending pick. Please try again later!');
        return;
      }
      setPosts(prev => prev.map((_post) => {
        if (_post._id === data._id) return data;
        return _post;
      }));
      setSelectedId(index); // Set selectedId after updating the posts
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ display: 'flex', gap: 10 }}>
      {post.post_imgs.map((image, index) => {
        const currentPercentage = getPrecentes(index);
        return (
          <View
            key={image.data} // Ensure each item has a unique key
            style={{
              width: width - 20,
              backgroundColor: Color.SECONDARY_BACKGROUND,
              marginLeft: 10,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderRadius: 12,
              paddingRight: 8,
            }}
          >
            <Image
              source={{ uri: `${EXPO_PUBLIC_API_URL}/uploads/${image.data}` }}
              style={{ width: 50, height: 50, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}
            />
            <Text style={{ color: Color.TEXT, fontWeight: 'bold', fontSize: 12 }}>
              Photo {index + 1}
            </Text>
            <View style={{ flexGrow: 1, backgroundColor: Color.PRIMARY_BUTTON_HOVER, height: 16 ,borderRadius:4,overflow:'hidden' }}>
              <Animated.View
                style={{
                  width: animatedWidths[index].interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', `100%`],  // Animate from 0% to the calculated percentage
                  }),
                  borderRadius:4,
                  height: 16,
                  backgroundColor: Color.PRIMARY_BUTTON,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                if (selectedId === null) {
                  handleSendPick(index);
                }
              }}
            >
              <View
                style={{
                  width: 30,
                  aspectRatio: 1,
                  backgroundColor: Color.PRIMARY_BUTTON,
                  borderRadius: 100,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 25,
                    aspectRatio: 1,
                    backgroundColor: selectedId === index ? Color.PRIMARY_BUTTON : Color.WHITE,
                    borderRadius: 100,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {selectedId === index && (
                    <SimpleLineIcons name={'fire'} color={Color.WHITE} size={20} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

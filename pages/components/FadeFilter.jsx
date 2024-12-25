import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const FadeFilter = ({ uri, style, resizeMode }) => {
  const opacity = useSharedValue(1);

  // Apply fade effect when the component mounts
  useEffect(() => {
    opacity.value = withTiming(0.5, {
      duration: 100, // Duration of the fade effect
      easing: Easing.inOut(Easing.ease),
    });
  }, []);

  // Animated style for opacity
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
      <Animated.Image
        source={{ uri: uri }}
        style={[style, animatedStyle]}
        resizeMode = {resizeMode}
      />
  );
};

const styles = StyleSheet.create({

});

export default FadeFilter;

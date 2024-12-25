import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const CoolFilter = ({ uri, style,resizeMode }) => {
  const backgroundColor = useSharedValue('rgba(0, 0, 255, 0)'); // Transparent overlay initially

  useEffect(() => {
    backgroundColor.value = withTiming('rgba(100, 100, 255, 0.5)', {
      duration: 100, // Duration of the cool effect
      easing: Easing.inOut(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: backgroundColor.value,
    };
  });

  return (
    <View style={style}>
      <Image
        source={{ uri: uri }}
        style={style}
        resizeMode={resizeMode}
      />
      <Animated.View style={[styles.overlay, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(100, 100, 255, 0.5)',
  },
});

export default CoolFilter;

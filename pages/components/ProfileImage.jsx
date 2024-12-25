// Import necessary modules from react-native and styled-components/native
import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Image} from 'expo-image'
import ExpoImage from 'expo-image/build/ExpoImage';
import { EXPO_PUBLIC_API_URL } from '@env';
// Function to handle the background gradient logic
const getGradientColors = (closeFriends, view) => {
  if (!view && closeFriends) {
    return ['#17e4c9', '#09e192', '#08b65f', '#11d14e', '#02f770'];
  }
  if (!view) {
    return ['#e48117', '#e14309', '#e20c2c', '#d81361', '#ee09a5'];
  }
  return ['rgba(111, 102, 102, 0.9)', 'rgba(111, 102, 102, 0.9)']; // Default color
};

// Styled component for the outer circle using LinearGradient
const OuterCircle = styled(View)`
  height: ${props => props.outlineSize}px;
  width: ${props => props.outlineSize}px;
  border-radius: ${props => props.outlineSize / 2}px;
  align-items: center;
  justify-content: center;
`;

// Styled component for the story image
const StoryImage = styled(ExpoImage)`
  height: ${props => props.size}px;
  width: ${props => props.size}px;
  border-radius: ${props => props.size / 2}px;
`;

// ProfileImage component
const ProfileImage = ({ user, size = 55, outlineSize = 56, closeFriends = false, view = false }) => {
  if (!user) return null;

  return (
      <StoryImage source={{ uri:user ? `${EXPO_PUBLIC_API_URL}/uploads/${user.profile_img}` : '' }} size={size} />
  );
};

export default ProfileImage;

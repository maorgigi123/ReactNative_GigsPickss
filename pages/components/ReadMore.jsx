import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Color from '../Colors/Color';

const ContentContainer = React.forwardRef(({ children, style }, ref) => (
  <View ref={ref} style={[styles.contentContainer, style]}>
    {children}
  </View>
));

const ReadMore = ({ text, maxRows = 5, maxCharacters = 100, color = 'white' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  // Prepare the displayed text based on the expansion state
  let displayedText = text;
  let readMoreText = null;

  if (!isExpanded && text.length > maxCharacters) {
    displayedText = text.slice(0, maxCharacters) + '...';
    readMoreText = (
      <TouchableOpacity onPress={toggleReadMore}>
        <Text style={[styles.readMoreText, { color: Color.PRIMARY_BUTTON }]}> Read More</Text>
      </TouchableOpacity>
    );
  } else if (isExpanded) {
    readMoreText = (
      <TouchableOpacity onPress={toggleReadMore}>
        <Text style={[styles.readMoreText, { color: Color.PRIMARY_BUTTON }]}> Show Less</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <ContentContainer ref={contentRef}>
        <Text
          style={{
            maxHeight: isExpanded ? 'none' : maxRows * 16, // 16 is the assumed line height
            color: color,
            lineHeight: 24, // Increase line height for better readability
          }}
        >
          {displayedText}
        </Text>
      </ContentContainer>
      {/* Render read more text after the main content */}
      {readMoreText}
    </View>
  );
};

export const SmartReadMore = ({ text, maxRows = 5, maxCharacters = 100, showReadMore = true,color = 'white' , fontSize = 14 , lineHeights = 16}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  useEffect(() => { 
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      // Uncomment if you want to use this height somewhere
      // setContentHeight(contentHeight);
    }
  }, [text]);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  // Split text by new lines and calculate actual rows
  const lines = text.split('\n');
  const actualRows = lines.length;
  let displayedText = text;
  const lineHeight = lineHeights; // Adjust as needed
  if (!isExpanded && text.length > maxCharacters) {
    displayedText = text.slice(0, maxCharacters) + '...';
  }

  return (
    <View>
      <ContentContainer ref={contentRef}>
        <TouchableOpacity onPress={toggleReadMore}>
          <Text
            style={{ maxHeight: isExpanded ? 'none' : maxRows * lineHeight, color: color , fontSize : fontSize }}
          >
            {displayedText}
          </Text>
        </TouchableOpacity>
      </ContentContainer>
    </View>
  );
};


const styles = StyleSheet.create({
  contentContainer: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
    wordBreak: 'break-all',
  },
  readMoreText: {
    fontWeight: 'bold', // Make "Read More" and "Show Less" bold for emphasis
    marginTop: 4, // Add some space above the link
  },
});

export default ReadMore;

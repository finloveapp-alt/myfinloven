import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

export default function FinloveLogo({ width = 200, height = 60 }) {
  return (
    <View style={{ width, height }}>
      <Svg width="100%" height="100%" viewBox="0 0 1000 300">
        {/* Heart shape in purple */}
        <Path 
          d="M250 50 C 150 50, 50 150, 150 250 C 250 350, 350 250, 250 150 C 150 50, 250 50, 250 50 Z" 
          fill="#9157ec" 
        />
        
        {/* Dollar sign in blue */}
        <SvgText 
          x="170" 
          y="180" 
          fontFamily="Arial" 
          fontSize="100" 
          fill="#00a0e4"
        >
          $
        </SvgText>
        
        {/* "love" text in purple */}
        <SvgText 
          x="400" 
          y="180" 
          fontFamily="Arial" 
          fontWeight="bold" 
          fontSize="150" 
          fill="#9157ec"
        >
          love
        </SvgText>
      </Svg>
    </View>
  );
}

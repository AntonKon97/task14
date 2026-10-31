import Ionicons from "@expo/vector-icons/Ionicons";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { wordsLearningActions } from "../store/wordsLearningSlice";
import { playSound } from "../services/soundHandler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

function WordCard({ wordInfo, setNext }) {
  const [showFullInfo, setShowFullInfo] = useState(false);
  const colors = useSelector((state) => state.theme.colors);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const dispatch = useDispatch();
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const screenWidth = Dimensions.get("window").width;
  const swipeThreshold = screenWidth / 2.3;
  const showTips = useSharedValue(false);
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const flipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    rotation.value = 0;
    translateX.value = 0;
    setShowFullInfo(false);
  }, [wordInfo.word]);

  const handleFlip = () => {
    if (showFullInfo) return;

    setShowFullInfo(true);
    rotation.value = withTiming(180, { duration: 400 });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      rotation.value,
      [0, 90, 180],
      [1, 0, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotateY: `${rotation.value}deg` }],
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      rotation.value,
      [0, 90, 180],
      [0, 0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotateY: `${rotation.value + 180}deg` }],
  }));

  const leftTipStyle = useAnimatedStyle(() => ({
    opacity:
      showTips.value && translateX.value > 0
        ? interpolate(
            translateX.value,
            [0, swipeThreshold],
            [0, 1],
            Extrapolation.CLAMP,
          )
        : 0,
  }));

  const rightTipStyle = useAnimatedStyle(() => ({
    opacity:
      showTips.value && translateX.value < 0
        ? interpolate(
            translateX.value,
            [-swipeThreshold, 0],
            [1, 0],
            Extrapolation.CLAMP,
          )
        : 0,
  }));

  const handleSwipeComplete = (direction) => {
    if (direction > 0) {
      dispatch(wordsLearningActions.updateWordLearnInfo(wordInfo.word));
    }

    setNext();
  };

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(showFullInfo)
        .onUpdate((event) => {
          translateX.value = event.translationX;
          showTips.value = true;
        })
        .onEnd((event) => {
          const distance = event.translationX;

          if (Math.abs(distance) < swipeThreshold) {
            showTips.value = false;
            translateX.value = withSpring(0);
            return;
          }

          const direction = distance > 0 ? 1 : -1;

          translateX.value = withTiming(
            direction * (screenWidth + 100),
            { duration: 250 },
            (finished) => {
              if (finished) {
                showTips.value = false;
                runOnJS(handleSwipeComplete)(direction);
              }
            },
          );
        }),
    [showFullInfo, swipeThreshold, screenWidth, wordInfo.word],
  );

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.wordContainer, animatedCardStyle]}>
          <Animated.View style={StyleSheet.absoluteFillObject}>
            <Animated.View
              style={[styles.cardSide, frontAnimatedStyle]}
              pointerEvents={showFullInfo ? "none" : "auto"}
            >
              <Pressable style={styles.cardPressable} onPress={handleFlip}>
                <Text style={styles.word}>{wordInfo.word}</Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              style={[styles.cardSide, styles.backSide, backAnimatedStyle]}
              pointerEvents={showFullInfo ? "auto" : "none"}
            >
              {wordInfo.image && (
                <Image style={styles.image} source={{ uri: wordInfo.image }} />
              )}

              <Text style={styles.word}>{wordInfo.word}</Text>
              <Text style={styles.phonetics}>{wordInfo.phonetics}</Text>

              <Pressable
                style={styles.playPressable}
                onPress={() => playSound(wordInfo.audio)}
              >
                <Ionicons
                  name="volume-medium-outline"
                  size={28}
                  color={colors.primary900}
                />
              </Pressable>

              <Text style={styles.meaning}>{wordInfo.meaning}</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[styles.tip, styles.leftTip, leftTipStyle]}
          >
            <Text style={styles.tipText}>Knew it</Text>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[styles.tip, styles.rightTip, rightTipStyle]}
          >
            <Text style={styles.tipText}>Learn again</Text>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    wordContainer: {
      flex: 1,
      borderColor: colors.primary200,
      borderWidth: 1,
      borderRadius: 8,
      position: "relative",
      backgroundColor: colors.appBackground,
      zIndex: 1,
    },

    cardSide: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "space-evenly",
      padding: 10,
      backfaceVisibility: "hidden",
    },

    backSide: {},

    cardPressable: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },

    word: {
      fontSize: 28,
      color: colors.fontMain,
      fontWeight: "800",
      paddingVertical: 15,
      textAlign: "center",
    },

    playPressable: {
      paddingVertical: 15,
    },

    phonetics: {
      fontSize: 18,
      color: colors.fontMain,
      paddingVertical: 15,
    },

    meaning: {
      fontSize: 18,
      color: colors.fontMain,
      padding: 5,
      textAlign: "center",
    },

    image: {
      width: 150,
      aspectRatio: 1,
      resizeMode: "contain",
    },

    tip: {
      position: "absolute",
      top: 20,
      padding: 10,
      borderRadius: 8,
    },

    leftTip: {
      left: 10,
      backgroundColor: "#2e7d32",
    },

    rightTip: {
      right: 10,
      backgroundColor: "#d32f2f",
    },

    tipText: {
      color: colors.fontInverse,
      fontSize: 16,
      fontWeight: "700",
    },
  });
}

export default WordCard;

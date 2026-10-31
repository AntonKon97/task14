import { View, Text, StyleSheet, Image } from "react-native";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { selectWordsToLearn } from "../../store/wordsLearningSlice";
import WordCard from "../../components/WordCard";

export default function Play() {
  const wordsToStudy = useSelector(selectWordsToLearn);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const colors = useSelector((state) => state.theme.colors);
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {wordsToStudy.length === 0 ? (
        <>
          <Text style={[styles.text, { alignSelf: "center" }]}>Congrats!</Text>
          <Text style={styles.text}>For now you have learnt all the words</Text>
          <Image
            style={styles.image}
            source={require("../../assets/well-done-icon.png")}
          />
        </>
      ) : (
        <View style={styles.deckContainer}>
          <View style={[styles.backCard, styles.backCardBottom]} />
          <View style={[styles.backCard, styles.backCardTop]} />

          <View style={styles.frontCard}>
            <WordCard
              wordInfo={wordsToStudy[currentWordIndex % wordsToStudy.length]}
              setNext={() =>
                setCurrentWordIndex(
                  (index) => (index + 1) % wordsToStudy.length,
                )
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.appBackground,
    },

    deckContainer: {
      flex: 1,
      position: "relative",
      marginHorizontal: 32,
      marginVertical: 50,
      marginRight: 48,
      marginBottom: 64,
    },

    backCard: {
      position: "absolute",
      borderWidth: 1,
      borderColor: colors.primary200,
      borderRadius: 8,
      backgroundColor: colors.appBackground,
    },

    backCardBottom: {
      top: 30,
      left: 30,
      right: -16,
      bottom: -16,
    },

    backCardTop: {
      top: 15,
      left: 15,
      right: -8,
      bottom: -8,
    },

    frontCard: {
      flex: 1,
      zIndex: 1,
    },

    text: {
      color: colors.fontMain,
      fontSize: 22,
      margin: 10,
      marginTop: 25,
    },

    image: {
      width: "100%",
      height: undefined,
      aspectRatio: 1,
      alignSelf: "center",
      resizeMode: "contain",
    },
  });
}

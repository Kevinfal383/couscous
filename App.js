import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

export default function App() {
  const [count, setCount] = useState(0);
  const maxShake = 100;

  // Animations
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const animatedBackground = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Effet son
  const [sound, setSound] = useState(null);

  // Jouer le son de victoire
  async function playVictorySound() {
    const { sound } = await Audio.Sound.createAsync(
      require("./assets/song/j'suis chaud.mpeg") // Mets ton fichier ici
    );
    setSound(sound);
    await sound.playAsync();
  }

  // Stopper et décharger le son
  async function stopVictorySound() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }

  // Nettoyer le son quand composant démonte
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Animation au changement de count
  useEffect(() => {
    // Barre fluide
    Animated.timing(animatedProgress, {
      toValue: count / maxShake,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Fond fluide
    Animated.timing(animatedBackground, {
      toValue: count >= maxShake ? 1.5 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Vibrer + son + pulse quand feu atteint
    if (count === maxShake) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animation pulse
      Animated.sequence([
        Animated.spring(animatedScale, {
          toValue: 1.3,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(animatedScale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      // Jouer son
      playVictorySound();
    }
  }, [count]);

  // Accéléromètre
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > 1) {
        setCount((prev) => (prev < maxShake ? prev + 1 : prev));
      }
    });
    return () => subscription.remove();
  }, []);

  // Reset
  const resetShake = () => {
    stopVictorySound(); // Stopper la musique
    setCount(0);
    animatedProgress.setValue(0);
    animatedBackground.setValue(0);
  };

  // Progression barre
  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Couleur fond
  const backgroundColor = animatedBackground.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1e3c72", "#ff512f"],
  });

  // Message motivant
  const getMessage = () => {
    if (count === 0) return "Prêt à secouer ?";
    if (count < 3) return "Continue, tu te réchauffes !";
    if (count < 6) return "Bien joué, à mi-chemin !";
    if (count < 9) return "Plus que quelques secousses !";
    if (count < 10) return "Presque au feu 🔥 !";
    return "Bravo ! Feu débloqué !";
  };

  const isFire = count >= maxShake;

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" />

      {/* Titre motivant */}
      <Text style={styles.title}>{getMessage()}</Text>

      {/* Image avec animation scale */}
      <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
        <Image
          source={
            isFire
              ? require("./assets/icons/feu.webp")
              : require("./assets/icons/flocan.webp")
          }
          style={styles.image}
          contentFit="contain"
          autoplay
        />
      </Animated.View>

      {/* Compteur */}
      <Text style={styles.counterText}>
        {count} / {maxShake} secousses
      </Text>

      {/* Barre progression */}
      <View style={styles.progressWrapper}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Bouton Reset */}
      <TouchableOpacity style={styles.button} onPress={resetShake}>
        <Text style={styles.buttonText}>Recommencer</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  counterText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },
  progressWrapper: {
    width: "80%",
    height: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

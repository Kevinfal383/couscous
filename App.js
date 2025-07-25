import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { Image } from "expo-image";

export default function App() {
  const [count, setCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const maxShake = 100;

  // Animation pour la barre
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Met à jour l’animation quand le count change
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: count / maxShake,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [count]);

  // Gestion de l’accéléromètre
  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(100); // fréquence 100ms
    setSubscription(
      Accelerometer.addListener(({ x, y, z }) => {
        const totalForce = Math.sqrt(x * x + y * y + z * z);
        if (totalForce > 2) {
          setCount((prev) => (prev < maxShake ? prev + 1 : prev));
        }
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // Réinitialiser le compteur
  const resetShake = () => {
    setCount(0);
    animatedProgress.setValue(0);
  };

  // Largeur animée
  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Image animée WebP */}
      <Image
        source={
          count < maxShake
            ? require("./assets/icons/flocan.webp")
            : require("./assets/icons/feu.webp")
        }
        style={styles.image}
        contentFit="contain"
        autoplay
      />

      {/* Texte compteur */}
      <Text style={styles.text}>{count} / {maxShake} secousses</Text>

      {/* Barre de progression fluide */}
      <View style={styles.progressWrapper}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Bouton Recommencer */}
      <TouchableOpacity style={styles.button} onPress={resetShake}>
        <Text style={styles.buttonText}>Recommencer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  progressWrapper: {
    width: 250,
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: 20,
    backgroundColor: "#4caf50",
  },
  button: {
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

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

export default function App() {
  const [count, setCount] = useState(0);
  const maxShake = 100;

  // Progression animée
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: count / maxShake,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [count]);

  // Abonnement aux secousses
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);
      if (totalForce > 1.5) {
        setCount((prev) => (prev < maxShake ? prev + 1 : prev));
      }
    });
    return () => subscription.remove();
  }, []);

  // Réinitialiser
  const resetShake = () => {
    setCount(0);
    animatedProgress.setValue(0);
  };

  // Largeur animée
  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Déterminer message motivation
  const getMessage = () => {
    if (count === 0) return "Prêt à secouer ?";
    if (count < 25) return "Continue, tu te réchauffes !";
    if (count < 50) return "Bien joué, à mi-chemin !";
    if (count < 75) return "Plus que quelques secousses !";
    if (count < 100) return "Presque au feu 🔥 !";
    return "Bravo ! Feu débloqué !";
  };

  const isFire = count >= maxShake;

  return (
    <View
      style={[
        styles.container,
        isFire ? styles.fireBackground : styles.snowBackground,
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Titre motivant */}
      <Text style={styles.title}>{getMessage()}</Text>

      {/* Image animée */}
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

      {/* Compteur */}
      <Text style={styles.counterText}>
        {count} / {maxShake} secousses
      </Text>

      {/* Barre de progression */}
      <View style={styles.progressWrapper}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Bouton Reset */}
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
    paddingHorizontal: 20,
  },
  snowBackground: {
    backgroundColor: "#1e3c72", // bleu froid
  },
  fireBackground: {
    backgroundColor: "#ff512f", // rouge/orange chaud
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

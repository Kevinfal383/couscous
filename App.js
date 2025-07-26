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
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CaloriesScreen from "./CaloriesScreen";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [count, setCount] = useState(0);
  const maxShake = 100;

  // Animations
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const animatedBackground = useRef(new Animated.Value(0)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Son
  const [sound, setSound] = useState(null);
  const isPlayingSound = useRef(false);

  // Historique secousses
  const shakeTimestamps = useRef([]);

  async function playVictorySound() {
    if (!isPlayingSound.current) {
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/song/j'suis chaud.mpeg")
      );
      setSound(sound);
      isPlayingSound.current = true;
      await sound.playAsync();
    }
  }

  async function stopVictorySound() {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (e) {
        console.log("Erreur arrêt son :", e);
      }
    }
    setSound(null);
    isPlayingSound.current = false;
  }

  // Arrêter musique quand on quitte la page
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      stopVictorySound();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Animation et gestion musique
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: count / maxShake,
      duration: 150,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedBackground, {
      toValue: count >= 90 ? 1 : 0,
      duration: 800,
      useNativeDriver: false,
    }).start();

    if (count >= 90 && !isPlayingSound.current) {
      playVictorySound();
    }

    if (count < 90 && isPlayingSound.current) {
      stopVictorySound();
    }

    if (count === maxShake) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    }
  }, [count]);

  // Détection secousses
  useEffect(() => {
    Accelerometer.setUpdateInterval(50);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > 1.3) {
        const now = Date.now();

        shakeTimestamps.current.push(now);

        shakeTimestamps.current = shakeTimestamps.current.filter(
          (t) => now - t <= 1000
        );

        const frequency = shakeTimestamps.current.length;

        if (frequency >= 3) {
          setCount((prev) => Math.min(prev + 1, maxShake));
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // Diminution auto
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      shakeTimestamps.current = shakeTimestamps.current.filter(
        (t) => now - t <= 1000
      );

      const frequency = shakeTimestamps.current.length;

      if (frequency < 3) {
        setCount((prev) => Math.max(prev - 1, 0));
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Reset
  const resetShake = () => {
    stopVictorySound();
    setCount(0);
    animatedProgress.setValue(0);
    animatedBackground.setValue(0);
  };

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const backgroundColor = animatedBackground.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1e3c72", "#ff512f"],
  });

  const getMessage = () => {
    if (count < 90) return "Encore un peu... Chauffe !";
    if (count < 100) return "🔥 Presque au max !";
    return "Bravo ! Feu total !";
  };

  const isHot = count >= 90;
  const calories = count * 0.5; // Exemple 0.5 kcal par secousse

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>{getMessage()}</Text>

      <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
        <Image
          source={
            isHot
              ? require("./assets/icons/feu.webp")
              : require("./assets/icons/flocan.webp")
          }
          style={styles.image}
          contentFit="contain"
        />
      </Animated.View>

      <Text style={styles.counterText}>
        {count} / {maxShake} secousses
      </Text>

      <View style={styles.progressWrapper}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <TouchableOpacity style={styles.button} onPress={resetShake}>
        <Text style={styles.buttonText}>Recommencer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 15 }]}
        onPress={() => navigation.navigate("Calories", { calories })}
      >
        <Text style={styles.buttonText}>Voir Calories</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Calories" component={CaloriesScreen} options={{ title: "Calories brûlées" }} />
      </Stack.Navigator>
    </NavigationContainer>
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

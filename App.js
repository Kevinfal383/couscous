import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ProgressBarAndroid, Platform } from "react-native";
import { Accelerometer } from "expo-sensors";
import { Image } from "expo-image";

export default function App() {
  const [count, setCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const maxShake = 10;

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(100); // 100ms
    setSubscription(
      Accelerometer.addListener(({ x, y, z }) => {
        const totalForce = Math.sqrt(x * x + y * y + z * z);
        if (totalForce > 1.5) {
          // Seuil de détection secousse
          setCount((prev) => (prev < maxShake ? prev + 1 : prev));
        }
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const progress = count / maxShake;

  return (
    <View style={styles.container}>
      <Image
        source={count < maxShake ? require("./assets/icons/flocan.webp") : require("./assets/icons/feu.webp")}
        style={{ width: 200, height: 200 }}
        contentFit="contain"
        autoplay
      />
      <Text style={styles.text}>{count} / {maxShake} secousses</Text>

      {/* Barre de progression */}
      {Platform.OS === "android" ? (
        <ProgressBarAndroid
          styleAttr="Horizontal"
          indeterminate={false}
          progress={progress}
          style={styles.progressBar}
        />
      ) : (
        <View style={styles.progressWrapper}>
          <View style={[styles.progressFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>
      )}
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
    resizeMode: "contain",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: 250,
    height: 20,
  },
  progressWrapper: {
    width: 250,
    height: 20,
    flexDirection: "row",
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#4caf50",
  },
});

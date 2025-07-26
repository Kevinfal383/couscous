import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CaloriesScreen({ route }) {
  const { calories } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calories brûlées :</Text>
      <Text style={styles.calories}>{calories.toFixed(1)} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e3c72",
  },
  text: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
  calories: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ff512f",
  },
});

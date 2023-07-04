import React, { useEffect, useState } from "react";

import { LinearGradient } from "expo-linear-gradient";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Image,
} from "react-native";
import { Snackbar } from "react-native-paper";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("Disertatie.db");

const HomeScreen = ({ navigation }) => {
  const [userExists, setUserExists] = useState(false);
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [buget, setBuget] = useState("");
  const [welcomeText, setWelcomeText] = useState("Welcome!");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInsert = () => {
    if (nume.trim() === "") {
      setErrorMessage("Va rugam completati numele!");
      setShowError(true);
      console.log("Validare reusita");
      return;
    }
    if (prenume.trim() === "") {
      setErrorMessage("Va rugam completati prenumele!");
      setShowError(true);
      console.log("Validare reusita");
      return;
    }
    if (buget.trim() === "") {
      setErrorMessage("Va rugam completati bugetul!");
      setShowError(true);
      console.log("Validare reusita");
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO Utilizator (Nume, Prenume, Buget) VALUES (?, ?, ?)",
        [nume, prenume, buget],
        (_, result) => {
          if (result.rowsAffected > 0) {
            console.log("Data inserted successfully.");
            // Clear the form after successful insertion
            setNume("");
            setPrenume("");
            setBuget("");
          }
        },
        (_, error) => {
          console.log("Error inserting data:", error);
        }
      );
    });
  };

  useEffect(() => {
    console.log("HomeScreen");
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Utilizator ORDER BY Id LIMIT 1",
        [],
        (_, result) => {
          // Process the query result
          if (result.rows.length > 0) {
            setUserExists(true);
            const numeUtilizator = result.rows.item(0).Nume;
            const prenumeUtilizator = result.rows.item(0).Prenume;
            const Id = result.rows.item(0).Id;
            setWelcomeText(numeUtilizator + " " + prenumeUtilizator + "!");
          } else {
            setUserExists(false);
          }
        },
        (_, error) => {
          console.log("Error fetching data:", error);
        }
      );
    });
  }, [nume]);

  if (userExists) {
    return (
      <ImageBackground
        source={require("./assets/cremgradient.jpg")}
        style={styles.containerHome}
      >
        <View style={styles.containerHome}>
          <Image
            source={require("./assets/BUDGET_PLANNER1.png")}
            style={styles.image}
          />

          <Text style={styles.titleHome1}>Bun venit,</Text>
          <Text style={styles.titleHome2}>{welcomeText}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.buttonHome}
              onPress={() => navigation.navigate("Venituri")}
            >
              <Text style={styles.buttonText}>Venituri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonHome}
              onPress={() => navigation.navigate("Cheltuieli")}
            >
              <Text style={styles.buttonText}>Cheltuieli</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonHome}
              onPress={() => navigation.navigate("Raport")}
            >
              <Text style={styles.buttonText}>Raport</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  } else {
    return (
      <ImageBackground
        source={require("./assets/cremgradient.jpg")}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>INTRODUCETI {"\n"} DATELE PERSONALE</Text>
          <TextInput
            style={styles.input}
            placeholder="Nume"
            value={nume}
            onChangeText={setNume}
          />
          <TextInput
            style={styles.input}
            placeholder="Prenume"
            value={prenume}
            onChangeText={setPrenume}
          />
          <TextInput
            style={styles.input}
            placeholder="Buget"
            value={buget}
            onChangeText={setBuget}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.button}
            title="Insert"
            onPress={handleInsert}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <Snackbar
            visible={showError}
            onDismiss={() => setShowError(false)}
            duration={3000}
            style={styles.snackbar}
          >
            {errorMessage}
          </Snackbar>
        </View>
      </ImageBackground>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerHome: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)", // Adjust the opacity as needed
    alignItems: "center",
  },

  titleHomeFirst: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 50,
    color: "white",
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "rgba(0, 128, 0, 0.5)",
    padding: 10,
  },
  titleHome1: {
    fontSize: 40,
    fontWeight: "bold",
    paddingTop: 70,
  },
  titleHome2: {
    fontSize: 30,
    fontWeight: "bold",
    paddingTop: 10,
    paddingBottom: 40,
  },
  buttonHome: {
    backgroundColor: "#0a8229",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 100,
    marginTop: 125,
    textAlign: "center",
  },
  buttons: {
    paddingtTop: 50,
    flexDirection: "row",
    columnGap: 10,
  },
  button: {
    backgroundColor: "#0a8229",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  image: {
    height: 100,
  },
  input: {
    width: 200, // Adjust the width as needed
    height: 40,
    borderWidth: 2,
    borderColor: "#01210a",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#f2f2f2",
  },
  snackbar: {
    backgroundColor: "#8f030a",
    fontWeight: "bold",
    borderRadius: 5,
  },
});

export default HomeScreen;

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ImageBackground,
  Keyboard,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as SQLite from "expo-sqlite";
import { Snackbar } from "react-native-paper";

const Cheltuieli = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const db = SQLite.openDatabase("Disertatie.db");
  const [denumire, setDenumire] = useState("");
  const [suma, setSuma] = useState("");
  const [tip, setTip] = useState("Unica");
  const [frecventa, setFrecventa] = useState("");
  const [categorie, setCategorie] = useState("Necesitati");
  const [data, setData] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [cheltuieli, setCheltuieli] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setData(selectedDate);
    }
  };

  const handleSumaChange = (text) => {
    // Replace any commas with dots
    const formattedText = text.replace(",", ".");

    // Perform additional validation if needed

    setSuma(formattedText);
  };

  const handleTipChange = (value) => {
    setTip(value);
    setFrecventa("");
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleInsert = () => {
    if (denumire.trim() == "") {
      setErrorMessage("Va rugam completati denumirea!");
      setShowError(true);
      console.log("Validare reusita");
      return;
    }
    if (suma.trim() == "") {
      setErrorMessage("Va rugam completati suma!");
      setShowError(true);
      console.log("Validare reusita");
      return;
    }
    if (tip.trim() == "Recurenta" && frecventa.trim() == "") {
      setErrorMessage("Va rugam completati frecventa!");
      setShowError(true);
      console.log("Validare reusita");
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO Cheltuieli (Denumire, Suma, Tip, Frecventa, Categorie, Data) VALUES (?, ?, ?, ?, ?, ?)",
        [
          denumire,
          suma,
          tip,
          frecventa,
          categorie,
          data.toISOString().split("T")[0],
        ],
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            console.log("Data inserted successfully.");
            // Additional logic or feedback if needed
          } else {
            console.log("Insertion failed.");
            // Additional logic or feedback if needed
          }
        },
        (_, error) => {
          console.log("Error inserting data:", error);
          // Additional error handling if needed
        }
      );
    });
    setModalVisible(false);
    setDenumire("");
    setData(new Date());
    setSuma("");
  };

  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const fetchCheltuieli = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Cheltuieli",
        [],
        (_, { rows }) => {
          const data = rows._array;
          setCheltuieli(data);
        },
        (_, error) => {
          console.log("Error fetching cheltuieli:", error);
        }
      );
    });
  };

  const renderCheltuielItem = ({ item }) => {
    const handleDeleteItem = () => {
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM Cheltuieli WHERE Id = ?",
          [item.Id],
          () => {
            console.log("Item deleted successfully");
            // Refresh the data after deletion
            fetchCheltuieli();
          },
          (_, error) => {
            console.log("Error deleting item:", error);
          }
        );
      });
    };

    return (
      <View style={[styles.itemContainer, { marginBottom: 10 }]}>
        <View style={[styles.firstrow]}>
          <Text style={styles.itemTextTitle}>{item.Denumire}</Text>

          <Text style={styles.itemTextTitle}>{item.Suma} RON </Text>
        </View>
        <Text style={styles.itemTextData}>Data: {item.Data}</Text>
        <Text style={styles.itemTextData}>Categorie: {item.Categorie}</Text>

        {item.Frecventa !== "" ? (
          <Text style={styles.itemText}>
            {item.Tip} ( {item.Frecventa} )
          </Text>
        ) : (
          <Text style={styles.itemText}>{item.Tip}</Text>
        )}

        <TouchableOpacity
          style={styles.buttonDelete}
          onPress={handleDeleteItem}
        >
          <Text style={styles.buttonText}>Sterge</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    fetchCheltuieli();
  }, [modalVisible]);

  return (
    <ImageBackground
      source={require("./assets/side-wave_background1.jpg")}
      style={styles.container}
    >
      <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>Adauga</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <ImageBackground
          source={require("./assets/side-wave_background1.jpg")}
          style={styles.containerAdauga}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.titleHome2}>Adaugare cheltuiala</Text>
          <Text style={styles.pickerLabel}>Denumire:</Text>
          <TextInput
            style={styles.input}
            value={denumire}
            onChangeText={setDenumire}
          />

          <Text style={styles.pickerLabel}>Suma:</Text>
          <TextInput
            value={suma}
            onChangeText={handleSumaChange}
            keyboardType="decimal-pad"
            style={styles.input}
          />
          <Text style={styles.pickerLabel}>Categorie:</Text>
          <View style={styles.pickerContainer} zIndex={3002}>
            <DropDownPicker
              items={[
                { label: "Necesitati", value: "Necesitati" },
                { label: "Distractie", value: "Distractie" },
                { label: "Dorinte", value: "Dorinte" },
                { label: "Neprevazute", value: "Neprevazute" },
                // Add more categories as needed
              ]}
              zIndex={3000}
              zIndexInverse={1000}
              open={open3}
              value={categorie}
              containerStyle={styles.picker}
              style={styles.innerPicker}
              dropDownStyle={{ backgroundColor: "#fafafa", zIndex: 3000 }}
              setOpen={setOpen3}
              setValue={setCategorie}
            />
          </View>

          <Text style={styles.pickerLabel}>Tip:</Text>
          <View style={styles.pickerContainer} zIndex={3001}>
            <DropDownPicker
              items={[
                { label: "Unica", value: "Unica" },
                { label: "Recurenta", value: "Recurenta" },
                // Add more categories as needed
              ]}
              zIndex={3000}
              open={open1}
              value={tip}
              containerStyle={styles.picker}
              style={styles.innerPicker}
              dropDownStyle={{ backgroundColor: "#fafafa", zIndex: 3000 }}
              setOpen={setOpen1}
              setValue={handleTipChange}
              overlayStyle={{
                // required
                flex: 1,
                justifyContent: "center",
                zIndex: 3000,
              }}
            />
          </View>

          <Text
            style={[
              styles.pickerLabel,
              { opacity: tip === "Recurenta" ? 1 : 0 },
            ]}
          >
            Frecventa:
          </Text>
          <View
            style={[
              styles.pickerContainer,
              { opacity: tip === "Recurenta" ? 1 : 0 },
            ]}
            zIndex={3000}
          >
            <DropDownPicker
              items={[
                { label: "Zilnic", value: "Zilnic" },
                { label: "Saptamanal", value: "Saptamanal" },
                { label: "Lunar", value: "Lunar" },
                // Add more categories as needed
              ]}
              zIndex={3000}
              zIndexInverse={1000}
              placeholder="Selecteaza frecventa"
              open={open2}
              value={frecventa}
              containerStyle={styles.picker}
              style={styles.innerPicker}
              dropDownStyle={{ backgroundColor: "#fafafa", zIndex: 3000 }}
              setOpen={setOpen2}
              setValue={setFrecventa}
              disabled={!(tip == "Recurenta")}
            />
          </View>

          <Text style={styles.pickerLabel}>Data:</Text>
          <DateTimePicker
            value={data}
            mode="date"
            display="default"
            accentColor="lightgreen"
            textColor="black"
            onChange={handleDateChange}
            style={styles.dateTimePicker}
            themeVariant="light"
          />

          <TouchableOpacity style={styles.buttonAdauga} onPress={handleInsert}>
            <Text style={styles.buttonText}>Adauga</Text>
          </TouchableOpacity>
          <Snackbar
            visible={showError}
            onDismiss={() => setShowError(false)}
            duration={3000}
            style={styles.snackbar}
          >
            {errorMessage}
          </Snackbar>
        </ImageBackground>
      </Modal>
      <View>
        <FlatList
          data={cheltuieli}
          renderItem={renderCheltuielItem}
          keyExtractor={(item) => item.Id.toString()}
          style={{ width: 350 }}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  containerAdauga: {
    paddingTop: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  firstrow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  titleHome2: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 40,
    textTransform: "uppercase",
  },
  closeButton: {
    backgroundColor: "#8f030a",
    position: "absolute",
    top: 69,
    right: 10,
    padding: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0a8229",
    padding: 10,
    marginLeft: 210,
    borderRadius: 7,
    width: 130,
    height: 50,
    alignItems: "center", // Horizontal alignment
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonAdauga: {
    backgroundColor: "#0a8229",
    padding: 10,
    borderRadius: 7,
    width: "95%",
    height: 50,
    alignItems: "center", // Horizontal alignment
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonDelete: {
    backgroundColor: "#8f030a",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    alignSelf: "center",
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
  pickerContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 30,
  },
  pickerLabel: {
    marginBottom: 5,
    fontSize: 20,
    fontWeight: "bold",
  },
  picker: {
    height: 40,
    width: 200,
  },
  innerPicker: {
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#01210a",
    borderRadius: 5,
  },
  dateTimePicker: {
    marginBottom: 30,
    textAlign: "center",
    justifyContent: "center",
  },
  itemContainer: {
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 10,
    width: "100%",
  },
  itemText: {
    fontSize: 17,
    marginBottom: 5,
    marginLeft: 10,
    marginTop: 5,
    textTransform: "uppercase",
  },
  itemTextData: {
    fontSize: 16,
    marginBottom: 7,
    marginLeft: 10,
    marginTop: 5,
    color: "black",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  itemTextTitle: {
    fontSize: 20,
    marginBottom: 15,
    marginTop: 5,
    color: "black",
    padding: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  snackbar: {
    backgroundColor: "#8f030a",
    fontWeight: "bold",
    borderRadius: 5,
  },
});

export default Cheltuieli;

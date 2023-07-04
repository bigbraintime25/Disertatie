import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PieChart } from "react-native-chart-kit";
import * as SQLite from "expo-sqlite";

const Raport = () => {
  const db = SQLite.openDatabase("Disertatie.db");
  const [buget, setBuget] = useState(0);
  const [fluxuri, setFluxuri] = useState([]);
  const [chartData, setChartData] = useState([]);

  const processCheltuieli = () => {
    const today = new Date().toISOString().split("T")[0];

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT Id, Denumire, Suma, ?,Categorie, Data FROM Cheltuieli WHERE Procesat = 0 AND Data < ?`,
        ["Cheltuiala", today],
        (_, { rows }) => {
          console.log("Data selected from Cheltuieli successfully.");
          const resultRows = rows._array;

          resultRows.forEach((row) => {
            const { Id, Denumire, Suma, Categorie, Data } = row;

            tx.executeSql(
              `INSERT INTO Fluxuri_Bugetare (Denumire, Suma, Tip, Data, Categorie) VALUES (?, ?, ?, ?, ?)`,
              [Denumire, Suma, "Cheltuiala", Data, Categorie],
              (_, insertResult) => {
                console.log(
                  "Data inserted into Fluxuri_Bugetare successfully."
                );
                const insertId = insertResult.insertId;

                tx.executeSql(
                  `UPDATE Cheltuieli SET Procesat = 1 WHERE Id = ?`,
                  [Id],
                  (_, updateResult) => {
                    console.log("Cheltuieli updated successfully.");
                    // Update Utilizator table
                    tx.executeSql(
                      `UPDATE Utilizator SET Buget = Buget - ? WHERE Id = 3`,
                      [Suma],
                      (_, budgetUpdateResult) => {
                        console.log("Utilizator budget updated successfully.");
                      },
                      (_, error) => {
                        console.log("Error updating Utilizator budget:", error);
                      }
                    );
                  },
                  (_, error) => {
                    console.log("Error updating Cheltuieli:", error);
                  }
                );
              },
              (_, error) => {
                console.log(
                  "Error inserting data into Fluxuri_Bugetare:",
                  error
                );
              }
            );
          });
        },
        (_, error) => {
          console.log("Error selecting data from Cheltuieli:", error);
        }
      );
    });
  };
  const processVenituri = () => {
    const today = new Date().toISOString().split("T")[0];

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT Id, Denumire, Suma, ?, Data FROM Venituri WHERE Procesat = 0 AND Data < ?`,
        ["Venit", today],
        (_, { rows }) => {
          console.log("Data selected from Venituri successfully.");
          const resultRows = rows._array;

          resultRows.forEach((row) => {
            const { Id, Denumire, Suma, Data } = row;
            const Categorie = "";

            tx.executeSql(
              `INSERT INTO Fluxuri_Bugetare (Denumire, Suma, Tip, Data, Categorie) VALUES (?, ?, ?, ?, ?)`,
              [Denumire, Suma, "Venit", Data, Categorie],
              (_, insertResult) => {
                console.log(
                  "Data inserted into Fluxuri_Bugetare successfully."
                );
                const insertId = insertResult.insertId;

                tx.executeSql(
                  `UPDATE Venituri SET Procesat = 1 WHERE Id = ?`,
                  [Id],
                  (_, updateResult) => {
                    console.log("Venituri updated successfully.");
                    // Update Utilizator table
                    tx.executeSql(
                      `UPDATE Utilizator SET Buget = Buget + ? WHERE Id = 3`,
                      [Suma],
                      (_, budgetUpdateResult) => {
                        console.log("Utilizator budget updated successfully.");
                      },
                      (_, error) => {
                        console.log("Error updating Utilizator budget:", error);
                      }
                    );
                  },
                  (_, error) => {
                    console.log("Error updating Venituri:", error);
                  }
                );
              },
              (_, error) => {
                console.log(
                  "Error inserting data into Fluxuri_Bugetare:",
                  error
                );
              }
            );
          });
        },
        (_, error) => {
          console.log("Error selecting data from Venituri:", error);
        }
      );
    });
  };

  const updateCheltuieli = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE Cheltuieli SET Procesat = 0, Data =
          CASE
            WHEN Frecventa = 'Zilnic' THEN date(Data, '+1 day')
            WHEN Frecventa = 'Saptamanal' THEN date(Data, '+7 day')
            WHEN Frecventa = 'Lunar' THEN date(Data, '+1 month')
            ELSE Data
          END
          WHERE Procesat = 1 AND Tip = 'Recurenta'`,
        [],
        (_, result) => {
          console.log("Cheltuieli table updated successfully.");

          const rowsAffected = result.rowsAffected;

          if (rowsAffected > 0) {
            processCheltuieli();
            updateCheltuieli();
          } else {
            console.log("No more rows to update.");
          }
        },
        (_, error) => {
          console.log("Error updating Cheltuieli table:", error);
        }
      );
    });
  };

  const updateVenituri = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE Venituri SET Procesat = 0, Data =
          CASE
            WHEN Frecventa = 'Zilnic' THEN date(Data, '+1 day')
            WHEN Frecventa = 'Saptamanal' THEN date(Data, '+7 day')
            WHEN Frecventa = 'Lunar' THEN date(Data, '+1 month')
            ELSE Data
          END
          WHERE Procesat = 1 AND Tip = 'Recurenta'`,
        [],
        (_, result) => {
          console.log("Cheltuieli table updated successfully.");

          const rowsAffected = result.rowsAffected;

          if (rowsAffected > 0) {
            processVenituri();
            updateVenituri();
          } else {
            console.log("No more rows to update.");
          }
        },
        (_, error) => {
          console.log("Error updating Cheltuieli table:", error);
        }
      );
    });
  };

  const fetchFluxuri = () => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Fluxuri_Bugetare ORDER BY Data desc",
        [],
        (_, { rows }) => {
          const data = rows._array;
          setFluxuri(data);
        },
        (_, error) => {
          console.log("Error fetching cheltuieli:", error);
        }
      );
    });
  };

  const renderFluxItem = ({ item }) => {
    return (
      <View
        style={{
          marginBottom: 10,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 15,
        }}
      >
        <Text
          style={[
            styles.itemTip,
            { color: item.Tip === "Cheltuiala" ? "#800000" : "green" },
          ]}
        >
          {item.Tip}
        </Text>

        <View style={[styles.firstrow]}>
          <Text style={styles.itemTextTitle}>{item.Denumire}</Text>

          <Text style={styles.itemTextTitle}>{item.Suma} RON </Text>
        </View>

        {item.Categorie !== "" && (
          <Text style={styles.itemText}>Categorie: {item.Categorie}</Text>
        )}

        <Text style={styles.itemText}>Data: {item.Data}</Text>
      </View>
    );
  };

  const fetchChartData = () => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT Categorie, SUM(Suma) as TotalSum FROM Fluxuri_Bugetare GROUP BY Categorie, Tip`,
        [],
        (_, result) => {
          console.log(result.rows._array);
          const data = result.rows._array;

          console.log(data);

          const dateGrafic = data.map((row) => ({
            name: row.Categorie || "Venit",
            value: row.TotalSum,
            color: getRandomColor(),
          }));

          console.log(dateGrafic);

          setChartData(dateGrafic);
        },
        (_, error) => {
          console.log("Error fetching chart data:", error);
        }
      );
    });
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    processVenituri();
    processCheltuieli();
    updateCheltuieli();
    updateVenituri();
    fetchFluxuri();
    fetchChartData();
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM Utilizator ORDER BY Id LIMIT 1",
        [],
        (_, result) => {
          // Process the query result
          if (result.rows.length > 0) {
            setBuget(result.rows.item(0).Buget);
          } else {
          }
        },
        (_, error) => {
          console.log("Error fetching data:", error);
        }
      );
    });
  }, []);
  return (
    <ImageBackground
      source={require("./assets/side-wave_background1.jpg")}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.title}>
          Buget curent: <Text style={styles.budget}>{buget} RON</Text>
        </Text>

        <View>
          <FlatList
            data={fluxuri}
            renderItem={renderFluxItem}
            keyExtractor={(item) => item.Id.toString()}
            style={styles.flatList}
          />
        </View>

        <View>
          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={370}
              height={300}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                hideLegend: false,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="35"
              // Add the legend configuration
              legend={{
                enabled: true,
                labels: ({ data }) =>
                  data.map((datum) => ({
                    name: datum.name,
                    color: datum.color,
                  })),
              }}
            />
          ) : (
            <Text>No data available.</Text>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  itemTip: {
    fontSize: 25,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  container: {
    flex: 1,
    paddingBottom: 390,
    backgroundColor: "blue",
  },
  budget: {
    color: "black",
    fontWeight: "bold",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 10,
  },
  title: {
    fontSize: 30,
    marginTop: 20,
    textAlign: "center",
    marginBottom: 40,
    textTransform: "uppercase",
  },
  flatList: {
    marginLeft: 30,
    marginRight: 30,
  },
  itemText: {
    fontSize: 17,
    color: "black",
    textTransform: "uppercase",
  },
  itemTextTitle: {
    fontSize: 20,
    color: "black",
    textTransform: "uppercase",
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  firstrow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Raport;

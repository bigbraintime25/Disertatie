import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import { StyleSheet, Text, View } from "react-native";
import HomeScreen from "./HomeScreen";
import Cheltuieli from "./Cheltuieli";
import Venituri from "./Venituri";
import Raport from "./Raport";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppRegistry } from "react-native";
import * as SQLite from "expo-sqlite";

const Stack = createStackNavigator();
const db = SQLite.openDatabase("Disertatie.db");

const createTables = () => {
  db.transaction((tx) => {
    // Create Utilizator table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS "Utilizator" (
        "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "Nume" TEXT,
        "Prenume" TEXT,
        "Buget" REAL
      );`,
      [],
      () => console.log("Utilizator table created successfully."),
      (error) => console.log("Error creating Utilizator table:", error)
    );

    // Create Cheltuieli table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS "Cheltuieli" (
        "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "Denumire" TEXT,
        "Suma" REAL,
        "Tip" TEXT,
        "Frecventa" TEXT,
        "Categorie" TEXT,
        "Data" TEXT,
        "Procesat" INTEGER DEFAULT 0
      );`,
      [],
      () => console.log("Cheltuieli table created successfully."),
      (error) => console.log("Error creating Cheltuieli table:", error)
    );

    // Create Venituri table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS "Venituri" (
        "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "Denumire" TEXT,
        "Suma" REAL,
        "Tip" TEXT,
        "Frecventa" TEXT,
        "Data" TEXT,
        "Procesat" INTEGER DEFAULT 0
      );`,
      [],
      () => console.log("Venituri table created successfully."),
      (error) => console.log("Error creating Venituri table:", error)
    );

    // Create Fluxuri_Bugetare table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS "Fluxuri_Bugetare" (
        "Id" INTEGER PRIMARY KEY AUTOINCREMENT,
        "Denumire" TEXT,
        "Suma" REAL,
        "Tip" TEXT,
        "Data" TEXT,
        "Categorie" TEXT
      );`,
      [],
      () => console.log("Fluxuri_Bugetare table created successfully."),
      (error) => console.log("Error creating Fluxuri_Bugetare table:", error)
    );
  });
};

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
              console.log("Data inserted into Fluxuri_Bugetare successfully.");
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
              console.log("Error inserting data into Fluxuri_Bugetare:", error);
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
              console.log("Data inserted into Fluxuri_Bugetare successfully.");
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
              console.log("Error inserting data into Fluxuri_Bugetare:", error);
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

export default function App() {
  useEffect(() => {
    if (db == null) {
      console.log(" e null ba");
    } else {
      try {
        // db.transaction((tx) => {
        //   // Create Utilizator table
        //   tx.executeSql(
        //     `Update Utilizator set Buget = 2500 where Id=3;`,
        //     [],
        //     () => console.log("Update for test succes"),
        //     (error) => console.log("Error update for test", error)
        //   );
        // });
      } catch (error) {
        console.log("Error executing transaction:", error);
      }
    }
    processVenituri();
    processCheltuieli();
    updateCheltuieli();
    updateVenituri();
  }, []);
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Cheltuieli" component={Cheltuieli} />
          <Stack.Screen name="Venituri" component={Venituri} />
          <Stack.Screen name="Raport" component={Raport} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

import { StatusBar } from "expo-status-bar";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@toDo_Key";

interface IToDos {
  [key: string]: {
    text: string;
    isWork: boolean;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 38,
    fontWeight: "700",
  },
  textInput: {
    marginVertical: 30,
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  toDo: {
    backgroundColor: theme.gray,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default function App() {
  const [isWorking, setIsWorking] = useState<boolean>(true);
  const [text, setText] = useState<string>("");
  const [toDos, setToDos] = useState<IToDos>({});

  const travel = () => setIsWorking(false);
  const work = () => setIsWorking(true);

  // 앱 실행될 때 localStorage를 로드.
  useEffect(() => {
    (async () => {
      try {
        const loadedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (loadedData) {
          const data = JSON.parse(loadedData) as IToDos;
          setToDos(data);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  // toDos가 바뀔 때 localStorage에 저장.
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toDos));
      } catch (error) {
        console.error(error);
      }
    })();
  }, [toDos]);

  const onTextChange = (payload: string) => {
    setText(payload);
  };

  const addToDo = () => {
    if (text === "") return;

    setToDos((currToDos) => ({
      ...currToDos,
      [Date.now()]: {
        text,
        isWork: isWorking,
      },
    }));
    setText("");
  };

  const deleteToDo = (toDoKey: string) => {
    Alert.alert(`Delete '${toDos[toDoKey].text}'`, "Are you sure?", [
      {
        text: "Cancle",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setToDos((currToDos) => {
            const newToDos = { ...currToDos };
            delete newToDos[toDoKey];
            return newToDos;
          }),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        {/* Work */}
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: isWorking ? "white" : theme.gray,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        {/* Travel */}
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: isWorking ? theme.gray : "white",
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      {/* Text Input */}
      <TextInput
        style={styles.textInput}
        placeholder={isWorking ? "Write what to do." : "Where do you go?"}
        keyboardType="default"
        onChangeText={onTextChange}
        value={text}
        onSubmitEditing={addToDo}
        returnKeyType="done"
      />
      <ScrollView>
        {Object.keys(toDos).map(
          (toDoKey) =>
            toDos[toDoKey].isWork === isWorking && (
              <View key={toDoKey} style={styles.toDo}>
                <Text style={styles.toDoText}>{toDos[toDoKey].text}</Text>
                <TouchableOpacity onPress={() => deleteToDo(toDoKey)}>
                  <Fontisto name="trash" size={18} color="red" />
                </TouchableOpacity>
              </View>
            )
        )}
      </ScrollView>
    </View>
  );
}

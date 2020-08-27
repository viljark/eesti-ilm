import { Warning } from "../services";
import { Text, View } from "react-native";
import React from "react";
import { monthNames } from "../utils/dateUtil";

export function Alert({ alert }: { alert: Warning }) {
  return (
    <>
      {alert && (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 10,
            padding: 3,
            borderRadius: 5,
            backgroundColor: "rgba(0,0,0, .1)",
            borderColor: "rgba(0,0,0, .3)",
            borderWidth: 0.5,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: "#fff",
              fontFamily: "Inter_700Bold",
            }}
          >
            <Text
              style={{
                color: "red",
                fontSize: 15,
                fontFamily: "Inter_700Bold",
              }}
            >
              ⚠{" "}
            </Text>
            Hoiatus: {new Date(alert.timestamp * 1000).getDate()}{" "}
            {monthNames[new Date(alert.timestamp * 1000).getMonth()]}
          </Text>
          <Text
            style={{
              color: "#fff",
              fontSize: 12,
              paddingLeft: 18,
              fontFamily: "Inter_300Light",
            }}
          >
            {alert.content_est}
          </Text>
        </View>
      )}
    </>
  );
}

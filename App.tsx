import { Button, StyleSheet, Modal, View, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";

export default function App() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const qrCodeLock = useRef(false);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert("Camera", "Você precisa habilitar o uso da camera");
      }

      setModalIsVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.log(error);
      setModalIsVisible(false);
    }
  }

  function handleQRCodeRead(data: string) {
    console.log(data);
    setModalIsVisible(false);
  }

  return (
    <View style={styles.container}>
      <Button title="QR-CODE" onPress={handleOpenCamera} />
      <Modal visible={modalIsVisible} style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrCodeLock.current) {
              qrCodeLock.current = true;
              handleQRCodeRead(data);
            }
          }}
        />
        <View style={styles.footer}>
          <Button title="cancelar" onPress={() => setModalIsVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
  },
});

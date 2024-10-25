import {
  Button,
  StyleSheet,
  Modal,
  View,
  Alert,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState, useEffect } from "react";
import { fetchNFCeData } from "./nfceParser";

export default function App() {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const qrCodeLock = useRef(false);
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    const width = Dimensions.get("window").width;
    setScreenWidth(width);
  }, []);

  async function handleOpenCamera() {
    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert("Camera", "Você precisa habilitar o uso da câmera");
      }

      setModalIsVisible(true);
      qrCodeLock.current = false;
    } catch (error) {
      console.log(error);
      setModalIsVisible(false);
    }
  }

  async function handleQRCodeRead(data: string) {
    try {
      // const nfceData = await fetchNFCeData(data);
      // // Aqui você pode fazer o que quiser com os dados
      // console.log("Dados da NFC-e:", nfceData);
      // // Exemplo de alerta com algumas informações
      // Alert.alert(
      //   "NFC-e Lida com Sucesso",
      //   `Empresa: ${nfceData.company.name}\n` +
      //     `Total: R$ ${nfceData.total.totalValue}\n` +
      //     `Itens: ${nfceData.products.length}`
      // );
      Alert.alert("QR-Code", data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível ler os dados da NFC-e");
      console.error(error);
    } finally {
      setModalIsVisible(false);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="QR-CODE" onPress={handleOpenCamera} />
      <Modal visible={modalIsVisible} style={{ flex: 1 }}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={({ data }) => {
            if (data && !qrCodeLock.current) {
              qrCodeLock.current = true;
              handleQRCodeRead(data);
            }
          }}
        />
        {/* Adiciona uma view sobre a camera para simular o scanner */}
        <View style={styles.overlayContainer}>
          <View
            style={[
              styles.overlay,
              { width: screenWidth * 0.6, height: screenWidth * 0.6 }, // Usando screenWidth do state
            ]}
          />
        </View>

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
  camera: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 32,
    right: 32,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    borderColor: "#fff",
    borderWidth: 3, // Borda branca
    borderRadius: 10, // Leve arredondamento
    borderStyle: "dashed", // Faz a borda ficar pontilhada
  },
});

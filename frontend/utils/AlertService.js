import { Platform, Alert } from "react-native";

const AlertService = {
    alert: (title, message, buttons = [{ text: "OK" }]) => {
        if (Platform.OS === "web") {
            window.alert(`${title}\n\n${message}`);
            const ok = buttons.find(b => b.onPress);
            if (ok?.onPress) ok.onPress();
        } else {
            Alert.alert(title, message, buttons);
        }
    },

    confirm: (title, message, onConfirm) => {
        if (Platform.OS === "web") {
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed) onConfirm();
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "OK", onPress: onConfirm }
                ]
            );
        }
    }
};

export default AlertService;

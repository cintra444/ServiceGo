import { Alert } from "react-native";
import * as Calendar from "expo-calendar";

interface DeviceCalendarEventInput {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  notes?: string;
  timeZone?: string;
}

export async function addEventToDeviceCalendar(input: DeviceCalendarEventInput) {
  try {
    const isAvailable = await Calendar.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Agenda", "O calendario do aparelho nao esta disponivel.");
      return false;
    }

    await Calendar.createEventInCalendarAsync({
      title: input.title,
      startDate: input.startDate,
      endDate: input.endDate,
      location: input.location,
      notes: input.notes,
      timeZone: input.timeZone ?? "America/Sao_Paulo",
    });
    return true;
  } catch {
    Alert.alert("Agenda", "Nao foi possivel abrir o calendario do aparelho.");
    return false;
  }
}

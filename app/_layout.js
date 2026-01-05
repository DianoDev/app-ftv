import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
    return (
        <>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#2196F3"
                translucent={false}
            />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
            </Stack>
        </>
    );
}
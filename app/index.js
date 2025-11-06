import { Redirect } from 'expo-router';

export default function Index() {
    // Redireciona para a tela de seleção de tipo de conta
    return <Redirect href="/src/screens/api/TestApiConnection" />;
}
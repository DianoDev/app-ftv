import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const RegisterJogadorScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    data_nascimento: '',
    genero: 'masculino',
    cpf: '',
    cidade: '',
    estado: '',
    nivel_habilidade: 'iniciante',
    posicao_preferida: 'ambos',
    bio: '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCPF = (text) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.slice(0, 11);
  };

  const formatDate = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleRegister = async () => {
    // Validações básicas
    if (!formData.nome || !formData.email || !formData.password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (formData.cpf.length !== 11) {
      Alert.alert('Erro', 'CPF inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register/jogador`, formData);

      if (response.data.success) {
        // Salvar token (você pode usar AsyncStorage aqui)
        const token = response.data.data.access_token;

        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao realizar cadastro';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cadastro de Jogador</Text>
        <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
      </View>

      <View style={styles.form}>
        {/* Nome */}
        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={formData.nome}
          onChangeText={(text) => handleChange('nome', text)}
        />

        {/* Email */}
        <Text style={styles.label}>E-mail *</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        {/* Telefone */}
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
        />

        {/* CPF */}
        <Text style={styles.label}>CPF *</Text>
        <TextInput
          style={styles.input}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          value={formData.cpf}
          onChangeText={(text) => handleChange('cpf', formatCPF(text))}
          maxLength={11}
        />

        {/* Data de Nascimento */}
        <Text style={styles.label}>Data de Nascimento *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          value={formData.data_nascimento}
          onChangeText={(text) => handleChange('data_nascimento', formatDate(text))}
          maxLength={10}
        />

        {/* Gênero */}
        <Text style={styles.label}>Gênero *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.genero}
            onValueChange={(value) => handleChange('genero', value)}
          >
            <Picker.Item label="Masculino" value="masculino" />
            <Picker.Item label="Feminino" value="feminino" />
            <Picker.Item label="Outro" value="outro" />
          </Picker>
        </View>

        {/* Cidade */}
        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua cidade"
          value={formData.cidade}
          onChangeText={(text) => handleChange('cidade', text)}
        />

        {/* Estado */}
        <Text style={styles.label}>Estado (UF)</Text>
        <TextInput
          style={styles.input}
          placeholder="SP"
          maxLength={2}
          autoCapitalize="characters"
          value={formData.estado}
          onChangeText={(text) => handleChange('estado', text)}
        />

        {/* Nível de Habilidade */}
        <Text style={styles.label}>Nível de Habilidade</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.nivel_habilidade}
            onValueChange={(value) => handleChange('nivel_habilidade', value)}
          >
            <Picker.Item label="Iniciante" value="iniciante" />
            <Picker.Item label="Intermediário" value="intermediario" />
            <Picker.Item label="Avançado" value="avancado" />
            <Picker.Item label="Profissional" value="profissional" />
          </Picker>
        </View>

        {/* Posição Preferida */}
        <Text style={styles.label}>Posição Preferida</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.posicao_preferida}
            onValueChange={(value) => handleChange('posicao_preferida', value)}
          >
            <Picker.Item label="Levantador" value="levantador" />
            <Picker.Item label="Atacante" value="atacante" />
            <Picker.Item label="Ambos" value="ambos" />
          </Picker>
        </View>

        {/* Bio */}
        <Text style={styles.label}>Biografia</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conte um pouco sobre você"
          multiline
          numberOfLines={4}
          value={formData.bio}
          onChangeText={(text) => handleChange('bio', text)}
        />

        {/* Senha */}
        <Text style={styles.label}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />

        {/* Confirmar Senha */}
        <Text style={styles.label}>Confirmar Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a senha novamente"
          secureTextEntry
          value={formData.password_confirmation}
          onChangeText={(text) => handleChange('password_confirmation', text)}
        />

        {/* Botão de Cadastro */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        {/* Link para Login */}
        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>
            Já tem uma conta? <Text style={styles.linkBold}>Faça login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  linkBold: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
});

export default RegisterJogadorScreen;

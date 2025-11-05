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
import axios from 'axios';

const API_URL = 'http://seu-servidor.com/api';

const RegisterProfessorScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    cpf: '',
    registro_profissional: '',
    data_nascimento: '',
    cidade: '',
    estado: '',
    anos_experiencia: '',
    preco_hora_aula: '',
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

  const formatPrice = (text) => {
    const numbers = text.replace(/\D/g, '');
    const value = parseFloat(numbers) / 100;
    return value.toFixed(2);
  };

  const handleRegister = async () => {
    // Validações básicas
    if (!formData.name || !formData.email || !formData.password) {
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
      const response = await axios.post(`${API_URL}/auth/register/professor`, formData);

      if (response.data.success) {
        // Salvar token
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
        <Text style={styles.title}>Cadastro de Professor</Text>
        <Text style={styles.subtitle}>Compartilhe seu conhecimento</Text>
      </View>

      <View style={styles.form}>
        {/* Nome */}
        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
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

        {/* Registro Profissional */}
        <Text style={styles.label}>Registro Profissional</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: CREF 123456-G/SP"
          value={formData.registro_profissional}
          onChangeText={(text) => handleChange('registro_profissional', text)}
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

        {/* Anos de Experiência */}
        <Text style={styles.label}>Anos de Experiência</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={formData.anos_experiencia}
          onChangeText={(text) => handleChange('anos_experiencia', text.replace(/\D/g, ''))}
        />

        {/* Preço por Hora/Aula */}
        <Text style={styles.label}>Preço por Hora/Aula (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={formData.preco_hora_aula}
          onChangeText={(text) => handleChange('preco_hora_aula', formatPrice(text))}
        />

        {/* Bio */}
        <Text style={styles.label}>Biografia / Apresentação</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conte sobre sua experiência como professor de futevôlei"
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
    backgroundColor: '#4CAF50',
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
  button: {
    backgroundColor: '#4CAF50',
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
    color: '#4CAF50',
  },
});

export default RegisterProfessorScreen;

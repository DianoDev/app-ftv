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

const RegisterArenaScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    nome_estabelecimento: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    numero_quadras: '1',
    horario_abertura: '',
    horario_fechamento: '',
    preco_hora_quadra: '',
    descricao: '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const formatCNPJ = (text) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.slice(0, 14);
  };

  const formatCEP = (text) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.slice(0, 8);
  };

  const formatPrice = (text) => {
    const numbers = text.replace(/\D/g, '');
    const value = parseFloat(numbers) / 100;
    return value.toFixed(2);
  };

  const handleRegister = async () => {
    // Validações básicas
    if (!formData.name || !formData.email || !formData.password || !formData.nome_estabelecimento) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (formData.cnpj.length !== 14) {
      Alert.alert('Erro', 'CNPJ inválido');
      return;
    }

    if (formData.cep.length !== 8) {
      Alert.alert('Erro', 'CEP inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register/arena`, formData);

      if (response.data.success) {
        // Salvar token
        const token = response.data.data.access_token;
        
        Alert.alert('Sucesso', 'Arena cadastrada com sucesso!', [
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
        <Text style={styles.title}>Cadastro de Arena</Text>
        <Text style={styles.subtitle}>Cadastre seu espaço esportivo</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Dados do Responsável</Text>

        {/* Nome do Responsável */}
        <Text style={styles.label}>Nome do Responsável *</Text>
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

        <Text style={styles.sectionTitle}>Dados do Estabelecimento</Text>

        {/* Nome do Estabelecimento */}
        <Text style={styles.label}>Nome do Estabelecimento *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Arena Beach Sports"
          value={formData.nome_estabelecimento}
          onChangeText={(text) => handleChange('nome_estabelecimento', text)}
        />

        {/* CNPJ */}
        <Text style={styles.label}>CNPJ *</Text>
        <TextInput
          style={styles.input}
          placeholder="00.000.000/0000-00"
          keyboardType="numeric"
          value={formData.cnpj}
          onChangeText={(text) => handleChange('cnpj', formatCNPJ(text))}
          maxLength={14}
        />

        {/* Número de Quadras */}
        <Text style={styles.label}>Número de Quadras *</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          keyboardType="numeric"
          value={formData.numero_quadras}
          onChangeText={(text) => handleChange('numero_quadras', text.replace(/\D/g, ''))}
        />

        {/* Preço por Hora/Quadra */}
        <Text style={styles.label}>Preço por Hora/Quadra (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={formData.preco_hora_quadra}
          onChangeText={(text) => handleChange('preco_hora_quadra', formatPrice(text))}
        />

        <Text style={styles.sectionTitle}>Endereço</Text>

        {/* CEP */}
        <Text style={styles.label}>CEP *</Text>
        <TextInput
          style={styles.input}
          placeholder="00000-000"
          keyboardType="numeric"
          value={formData.cep}
          onChangeText={(text) => handleChange('cep', formatCEP(text))}
          maxLength={8}
        />

        {/* Endereço */}
        <Text style={styles.label}>Endereço *</Text>
        <TextInput
          style={styles.input}
          placeholder="Rua, Avenida, etc"
          value={formData.endereco}
          onChangeText={(text) => handleChange('endereco', text)}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {/* Número */}
            <Text style={styles.label}>Número *</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              value={formData.numero}
              onChangeText={(text) => handleChange('numero', text)}
            />
          </View>

          <View style={styles.halfWidth}>
            {/* Complemento */}
            <Text style={styles.label}>Complemento</Text>
            <TextInput
              style={styles.input}
              placeholder="Apto, Sala..."
              value={formData.complemento}
              onChangeText={(text) => handleChange('complemento', text)}
            />
          </View>
        </View>

        {/* Bairro */}
        <Text style={styles.label}>Bairro *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do bairro"
          value={formData.bairro}
          onChangeText={(text) => handleChange('bairro', text)}
        />

        <View style={styles.row}>
          <View style={styles.flexWidth}>
            {/* Cidade */}
            <Text style={styles.label}>Cidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Sua cidade"
              value={formData.cidade}
              onChangeText={(text) => handleChange('cidade', text)}
            />
          </View>

          <View style={styles.quarterWidth}>
            {/* Estado */}
            <Text style={styles.label}>UF *</Text>
            <TextInput
              style={styles.input}
              placeholder="SP"
              maxLength={2}
              autoCapitalize="characters"
              value={formData.estado}
              onChangeText={(text) => handleChange('estado', text)}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            {/* Horário Abertura */}
            <Text style={styles.label}>Abertura</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              value={formData.horario_abertura}
              onChangeText={(text) => handleChange('horario_abertura', text)}
            />
          </View>

          <View style={styles.halfWidth}>
            {/* Horário Fechamento */}
            <Text style={styles.label}>Fechamento</Text>
            <TextInput
              style={styles.input}
              placeholder="22:00"
              value={formData.horario_fechamento}
              onChangeText={(text) => handleChange('horario_fechamento', text)}
            />
          </View>
        </View>

        {/* Descrição */}
        <Text style={styles.label}>Descrição da Arena</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva as facilidades, comodidades e diferenciais da sua arena"
          multiline
          numberOfLines={4}
          value={formData.descricao}
          onChangeText={(text) => handleChange('descricao', text)}
        />

        <Text style={styles.sectionTitle}>Segurança</Text>

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
            <Text style={styles.buttonText}>Cadastrar Arena</Text>
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
    backgroundColor: '#FF9800',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 24,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF9800',
    paddingBottom: 8,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  flexWidth: {
    flex: 2,
  },
  quarterWidth: {
    flex: 0.5,
  },
  button: {
    backgroundColor: '#FF9800',
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
    color: '#FF9800',
  },
});

export default RegisterArenaScreen;

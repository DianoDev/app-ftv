import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { StorageService } from '../../../services/storage';
import { API_CONFIG } from '../../../config/api.config';
import { Colors, Typography, Spacing, BorderRadius } from '../../../styles/theme';

export default function CreatePostScreen() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [conteudo, setConteudo] = useState('');
    const [imagem, setImagem] = useState(null);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar suas fotos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImagem(result.assets[0]);
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permissão Necessária', 'Precisamos de permissão para acessar a câmera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.8,
            });

            if (!result.canceled) {
                setImagem(result.assets[0]);
            }
        } catch (error) {
            console.error('Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto');
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Adicionar Imagem',
            'Escolha uma opção',
            [
                {
                    text: 'Tirar Foto',
                    onPress: takePhoto,
                },
                {
                    text: 'Escolher da Galeria',
                    onPress: pickImage,
                },
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
            ]
        );
    };

    const removeImage = () => {
        setImagem(null);
    };

    const validateForm = () => {
        if (!conteudo.trim()) {
            Alert.alert('Atenção', 'Por favor, escreva algo no seu post');
            return false;
        }

        if (conteudo.length > 500) {
            Alert.alert('Atenção', 'O conteúdo deve ter no máximo 500 caracteres');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            const token = await StorageService.getToken();

            if (!token) {
                Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
                router.replace('/src/screens/auth/LoginScreen');
                return;
            }

            const formData = new FormData();
            formData.append('conteudo', conteudo.trim());

            if (imagem) {
                const filename = imagem.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('imagem', {
                    uri: imagem.uri,
                    name: filename,
                    type,
                });
            }

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/posts`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            // IMPORTANTE: Fazer o parse do JSON
            let data;
            try {
                data = await response.json();
                console.log('Data parsed:', data);
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', parseError);
                // Se der erro no parse, mas a resposta foi ok (201), considerar sucesso
                if (response.ok) {
                    data = { success: true };
                } else {
                    throw new Error('Erro ao processar resposta do servidor');
                }
            }

            if (response.ok) {
                Alert.alert(
                    'Sucesso',
                    'Post criado com sucesso! Ele ficará disponível por 24 horas.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                throw new Error(data?.message || 'Erro ao criar post');
            }
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Alert.alert('Erro', error.message || 'Não foi possível criar o post');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Novo Post</Text>
                        <Text style={styles.subtitle}>Compartilhe com seus amigos</Text>
                    </View>
                    <View style={styles.headerRight} />
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="time-outline" size={20} color="#FFD300" />
                    <Text style={styles.infoText}>
                        Seu post ficará disponível por 24 horas
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Image Preview */}
                    {imagem ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                source={{ uri: imagem.uri }}
                                style={styles.imagePreview}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={removeImage}
                            >
                                <Ionicons name="close-circle" size={32} color="#FF5252" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.imagePlaceholder}
                            onPress={showImageOptions}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="camera" size={48} color="#FFD300" />
                            <Text style={styles.imagePlaceholderText}>
                                Adicionar Imagem
                            </Text>
                            <Text style={styles.imagePlaceholderSubtext}>
                                Toque para tirar foto ou escolher da galeria
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Content Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            <Ionicons name="create" size={16} color="#FFD300" /> Conteúdo *
                        </Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="O que você quer compartilhar?"
                                value={conteudo}
                                onChangeText={setConteudo}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                placeholderTextColor="#666666"
                                maxLength={500}
                            />
                        </View>
                        <Text style={styles.helperText}>
                            {conteudo.length}/500 caracteres
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="#000000" size="small" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#000000" />
                                <Text style={styles.submitButtonText}>Publicar Post</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.huge,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerRight: {
        width: 40,
    },
    title: {
        fontSize: Typography.sizes.h2,
        fontWeight: Typography.fonts.displayWeight,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 211, 0, 0.1)',
        borderWidth: 1,
        borderColor: '#FFD300',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: Typography.sizes.body,
        color: '#FFD300',
        fontWeight: Typography.fonts.headingWeight,
    },
    form: {
        backgroundColor: '#1a1a1a',
        borderRadius: BorderRadius.card,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    imagePreviewContainer: {
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: 9 / 16,
        backgroundColor: '#2a2a2a',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 16,
    },
    imagePlaceholder: {
        aspectRatio: 9 / 16,
        backgroundColor: '#2a2a2a',
        borderRadius: BorderRadius.lg,
        borderWidth: 2,
        borderColor: '#FFD300',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        padding: Spacing.xl,
    },
    imagePlaceholderText: {
        fontSize: Typography.sizes.h3,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFD300',
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    imagePlaceholderSubtext: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
        color: '#FFFFFF',
        marginBottom: Spacing.sm,
    },
    inputContainer: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        borderRadius: BorderRadius.input,
        paddingHorizontal: Spacing.md,
    },
    input: {
        paddingVertical: Spacing.md,
        fontSize: Typography.sizes.body,
        color: '#FFFFFF',
    },
    textAreaContainer: {
        paddingTop: Spacing.md,
    },
    textArea: {
        minHeight: 150,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: Typography.sizes.caption,
        color: '#999999',
        marginTop: Spacing.xs,
        textAlign: 'right',
    },
    submitButton: {
        backgroundColor: '#FFD300',
        padding: Spacing.base,
        borderRadius: BorderRadius.button,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
        shadowColor: '#FFD300',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#000000',
        fontSize: Typography.sizes.body,
        fontWeight: Typography.fonts.headingWeight,
    },
});
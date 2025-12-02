# AmizadeService - Documentação

## 📋 Visão Geral

O `AmizadeService` é um serviço centralizado para gerenciar todas as operações relacionadas a amizades no aplicativo. Ele encapsula chamadas à API de amizades e fornece uma interface consistente e fácil de usar.

**Arquivo:** `app/src/services/amizadeService.js`

---

## 🎯 Funcionalidades

### 1. **listarAmigos()**
Lista todos os amigos do usuário autenticado (amizades confirmadas).

**Retorno:**
```javascript
{
    success: true,
    data: [
        {
            id: 1,
            name: "João Silva",
            email: "joao@example.com",
            // outros campos...
        }
    ]
}
```

**Uso:**
```javascript
import { AmizadeService } from '../services/amizadeService';

const result = await AmizadeService.listarAmigos();
if (result.success) {
    setAmigos(result.data);
}
```

---

### 2. **listarSolicitacoesPendentes()**
Lista todas as solicitações de amizade pendentes (recebidas pelo usuário).

**Retorno:**
```javascript
{
    success: true,
    data: [
        {
            id: 10,
            solicitante: {
                id: 5,
                name: "Maria Santos",
                email: "maria@example.com"
            },
            created_at: "2024-11-26T..."
        }
    ]
}
```

**Uso:**
```javascript
const result = await AmizadeService.listarSolicitacoesPendentes();
if (result.success) {
    setSolicitacoesPendentes(result.data);
}
```

---

### 3. **buscarUsuarios(termo)**
Busca usuários por nome ou email.

**Parâmetros:**
- `termo` (string): Nome ou email para buscar

**Retorno:**
```javascript
{
    success: true,
    data: [
        {
            id: 3,
            nome: "Carlos Pereira",
            email: "carlos@example.com"
        }
    ]
}
```

**Uso:**
```javascript
const result = await AmizadeService.buscarUsuarios('carlos');
if (result.success) {
    setUsuarios(result.data);
}
```

---

### 4. **enviarSolicitacao(amigoId)**
Envia uma solicitação de amizade para outro usuário.

**Parâmetros:**
- `amigoId` (number): ID do usuário para enviar solicitação

**Retorno:**
```javascript
{
    success: true,
    message: "Solicitação de amizade enviada!"
}
```

**Uso:**
```javascript
const result = await AmizadeService.enviarSolicitacao(5);
if (result.success) {
    Alert.alert('Sucesso', result.message);
}
```

---

### 5. **aceitarSolicitacao(amizadeId)**
Aceita uma solicitação de amizade recebida.

**Parâmetros:**
- `amizadeId` (number): ID da solicitação de amizade

**Retorno:**
```javascript
{
    success: true,
    message: "Solicitação aceita com sucesso!"
}
```

**Uso:**
```javascript
const result = await AmizadeService.aceitarSolicitacao(10);
if (result.success) {
    Alert.alert('Sucesso', result.message);
    // Recarregar listas
}
```

---

### 6. **recusarSolicitacao(amizadeId)**
Recusa uma solicitação de amizade recebida.

**Parâmetros:**
- `amizadeId` (number): ID da solicitação de amizade

**Retorno:**
```javascript
{
    success: true,
    message: "Solicitação recusada!"
}
```

**Uso:**
```javascript
const result = await AmizadeService.recusarSolicitacao(10);
if (result.success) {
    Alert.alert('Sucesso', result.message);
}
```

---

### 7. **removerAmigo(amizadeId)**
Remove um amigo (desfaz a amizade).

**Parâmetros:**
- `amizadeId` (number): ID da amizade

**Retorno:**
```javascript
{
    success: true,
    message: "Amigo removido com sucesso!"
}
```

**Uso:**
```javascript
Alert.alert(
    'Remover Amigo',
    'Tem certeza?',
    [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Remover',
            onPress: async () => {
                const result = await AmizadeService.removerAmigo(amigoId);
                if (result.success) {
                    Alert.alert('Sucesso', result.message);
                }
            }
        }
    ]
);
```

---

## 🔄 Endpoints da API Utilizados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/amizades/meus-amigos` | Lista amigos |
| GET | `/api/amizades/solicitacoes-pendentes` | Lista solicitações pendentes |
| GET | `/api/usuarios/buscar?termo=` | Busca usuários |
| POST | `/api/amizades/enviar-solicitacao` | Envia solicitação |
| POST | `/api/amizades/{id}/aceitar` | Aceita solicitação |
| POST | `/api/amizades/{id}/recusar` | Recusa solicitação |
| DELETE | `/api/amizades/{id}` | Remove amigo |

---

## 🛡️ Tratamento de Erros

Todos os métodos retornam um objeto padronizado:

**Sucesso:**
```javascript
{
    success: true,
    data: [...],        // Quando há dados
    message: "..."      // Quando é ação
}
```

**Erro:**
```javascript
{
    success: false,
    message: "Mensagem de erro"
}
```

**Exemplo de uso com tratamento:**
```javascript
const handleBuscar = async () => {
    try {
        const result = await AmizadeService.buscarUsuarios(searchTerm);

        if (result.success) {
            setUsuarios(result.data);
        } else {
            Alert.alert('Erro', result.message);
        }
    } catch (error) {
        Alert.alert('Erro', 'Erro inesperado ao buscar');
    }
};
```

---

## 📱 Telas Atualizadas

### **ListAmigosScreen.js**
- ✅ Usa `listarAmigos()`
- ✅ Usa `listarSolicitacoesPendentes()`
- ✅ Usa `aceitarSolicitacao()`
- ✅ Usa `recusarSolicitacao()`
- ✅ Usa `removerAmigo()`

### **AdicionarAmigoScreen.js**
- ✅ Usa `buscarUsuarios()`
- ✅ Usa `enviarSolicitacao()`

### **CreateSolicitacaoRachaScreen.js**
- ✅ Usa `listarAmigos()` (para seleção de parceiro)

### **SolicitacaoDetailScreen.js**
- ✅ Usa `listarAmigos()` (para seleção de parceiro)

---

## 🔒 Autenticação

Todos os métodos do service:
- Requerem autenticação via token
- Token é obtido automaticamente do `StorageService`
- Inclui header `Authorization: Bearer {token}`
- Retorna erro se token não estiver presente

---

## 🎨 Padrões de Código

### Import
```javascript
import { AmizadeService } from '../services/amizadeService';
```

### Async/Await
Todos os métodos são assíncronos:
```javascript
const result = await AmizadeService.nomeDoMetodo(params);
```

### Error Handling
```javascript
try {
    const result = await AmizadeService.metodo();
    if (result.success) {
        // Sucesso
    } else {
        // Erro tratado
    }
} catch (error) {
    // Erro não tratado
}
```

---

## ✅ Benefícios

1. **Centralização:** Toda lógica de API em um único lugar
2. **Reutilização:** Mesmas funções usadas em múltiplas telas
3. **Manutenção:** Mudanças na API requerem alteração em apenas um arquivo
4. **Consistência:** Retornos padronizados facilitam tratamento
5. **Tipagem:** Fácil adicionar TypeScript no futuro
6. **Testabilidade:** Service pode ser mockado para testes

---

## 🔄 Migração de Código Legado

**Antes (direto na tela):**
```javascript
const fetchAmigos = async () => {
    const token = await StorageService.getToken();
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/amizades/meus-amigos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
        setAmigos(data.data);
    }
};
```

**Depois (usando service):**
```javascript
const fetchAmigos = async () => {
    const result = await AmizadeService.listarAmigos();
    if (result.success) {
        setAmigos(result.data);
    }
};
```

**Redução:** ~10 linhas → ~4 linhas por chamada

---

## 🚀 Exemplos Práticos

### Buscar e Adicionar Amigo
```javascript
const handleBuscarEAdicionar = async () => {
    // Buscar
    const buscaResult = await AmizadeService.buscarUsuarios('joão');

    if (buscaResult.success && buscaResult.data.length > 0) {
        const usuario = buscaResult.data[0];

        // Adicionar
        const addResult = await AmizadeService.enviarSolicitacao(usuario.id);

        if (addResult.success) {
            Alert.alert('Sucesso', 'Solicitação enviada!');
        }
    }
};
```

### Aceitar Todas as Solicitações Pendentes
```javascript
const handleAceitarTodas = async () => {
    const result = await AmizadeService.listarSolicitacoesPendentes();

    if (result.success) {
        for (const solicitacao of result.data) {
            await AmizadeService.aceitarSolicitacao(solicitacao.id);
        }
        Alert.alert('Sucesso', 'Todas as solicitações foram aceitas!');
    }
};
```

---

## 📝 Notas Importantes

1. **Token Obrigatório:** Todas as operações requerem usuário autenticado
2. **Rate Limiting:** API pode ter limites de requisições
3. **Validação:** Service valida parâmetros básicos (ID não vazio, termo não vazio)
4. **Loading States:** Telas devem gerenciar estados de loading
5. **Refresh:** Após ações (aceitar, remover), recarregar listas

---

## 🔧 Manutenção Futura

Para adicionar novos métodos ao service:

```javascript
/**
 * Bloquear usuário
 */
async bloquearUsuario(usuarioId) {
    try {
        const token = await StorageService.getToken();

        if (!token) {
            throw new Error('Usuário não autenticado');
        }

        const response = await apiRequest(`/api/usuarios/${usuarioId}/bloquear`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.success) {
            return {
                success: true,
                message: response.message || 'Usuário bloqueado!',
            };
        }

        throw new Error(response.message || 'Erro ao bloquear');
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Erro ao bloquear usuário',
        };
    }
},
```

---

## 🎯 Checklist de Implementação

- [x] Service criado em `/services/amizadeService.js`
- [x] ListAmigosScreen atualizado
- [x] AdicionarAmigoScreen atualizado
- [x] CreateSolicitacaoRachaScreen usando o service
- [x] SolicitacaoDetailScreen usando o service
- [x] Imports atualizados (removido API_CONFIG direto)
- [x] Tratamento de erros padronizado
- [x] Documentação criada

---

## 📚 Referências

- **API Config:** `app/src/config/api.config.js`
- **Storage Service:** `app/src/services/storage.js`
- **Backend API:** `/api/amizades/*`

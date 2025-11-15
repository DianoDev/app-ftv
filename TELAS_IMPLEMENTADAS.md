# Telas Implementadas - App FTV

## Visão Geral

Foram implementadas 3 telas principais para o módulo de jogador:

1. **ArenasListScreen** - Listagem de arenas disponíveis
2. **CreateSolicitacaoRachaScreen** - Criar nova solicitação de racha
3. **SolicitacoesListScreen** - Listagem de solicitações de racha

---

## 1. Tela de Listagem de Arenas

**Localização:** `/app/src/screens/user_jogador/arenas/ArenasListScreen.js`

### Funcionalidades:
- ✅ Listagem de todas as arenas ativas
- ✅ Busca por nome ou cidade
- ✅ Paginação automática (scroll infinito)
- ✅ Pull-to-refresh
- ✅ Exibição de informações:
  - Nome da arena
  - Localização (cidade/estado)
  - Rating (avaliação)
  - Telefone e WhatsApp
  - Comodidades
  - Descrição
- ✅ Navegação para detalhes da arena (ao clicar no card)

### Como usar:
```javascript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/src/screens/user_jogador/arenas/ArenasListScreen');
```

### API usada:
- `GET /api/arenas` - Listar arenas
- `GET /api/arenas/buscar?q=termo` - Buscar arenas

---

## 2. Tela de Criar Solicitação de Racha

**Localização:** `/app/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen.js`

### Funcionalidades:
- ✅ Formulário completo de criação de solicitação
- ✅ Seleção de arena (dropdown)
- ✅ Seleção de data (date picker)
- ✅ Seleção de horário início e fim (time picker)
- ✅ Campos:
  - Arena (obrigatório)
  - Data do jogo (obrigatório)
  - Hora início (obrigatório)
  - Hora fim (obrigatório)
  - Limite de participantes (obrigatório)
  - Nível sugerido (opcional)
  - Valor total estimado (opcional)
  - Valor por pessoa (opcional)
  - Descrição (opcional, max 500 caracteres)
  - Observações (opcional, max 1000 caracteres)
- ✅ Validações de formulário
- ✅ Contador de caracteres para campos de texto
- ✅ Loading state durante criação
- ✅ Feedback de sucesso/erro

### Como usar:
```javascript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen');
```

### API usada:
- `GET /api/arenas` - Carregar lista de arenas
- `POST /api/minhas-solicitacoes-racha` - Criar solicitação

### Validações:
- Arena deve ser selecionada
- Data deve ser hoje ou futura
- Hora de início deve ser informada
- Hora de fim deve ser informada e posterior à hora de início
- Limite de participantes deve ser no mínimo 2

---

## 3. Tela de Listagem de Solicitações

**Localização:** `/app/src/screens/user_jogador/racha/SolicitacoesListScreen.js`

### Funcionalidades:
- ✅ Listagem de solicitações de racha
- ✅ Tabs para filtrar:
  - Abertas (apenas solicitações abertas e futuras)
  - Todas (todas as solicitações)
- ✅ Exibição de informações:
  - Data e hora
  - Arena
  - Localização
  - Status (aberta, confirmada, cancelada, concluída)
  - Participantes (atual/limite)
  - Nível sugerido
  - Valor por pessoa
  - Descrição
- ✅ Paginação automática
- ✅ Pull-to-refresh
- ✅ Botão para criar nova solicitação
- ✅ Navegação para detalhes (ao clicar no card)

### Como usar:
```javascript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/src/screens/user_jogador/racha/SolicitacoesListScreen');
```

### API usada:
- `GET /api/solicitacoes-racha-public` - Listar solicitações

---

## Serviços Criados

### ArenaService
**Localização:** `/app/src/services/arenaService.js`

Métodos disponíveis:
- `listArenas(params)` - Listar arenas
- `getArena(id)` - Buscar arena por ID
- `searchArenas(searchTerm, params)` - Buscar por nome/cidade
- `searchByLocation(cidade, estado, params)` - Buscar por localização
- `searchNearby(latitude, longitude, raioKm, params)` - Buscar arenas próximas

### SolicitacaoRachaService
**Localização:** `/app/src/services/solicitacaoRachaService.js`

Métodos disponíveis:
- `listSolicitacoes(params)` - Listar solicitações (público)
- `getSolicitacao(id)` - Buscar solicitação por ID
- `getMinhasSolicitacoes(params)` - Listar minhas solicitações (autenticado)
- `createSolicitacao(data)` - Criar nova solicitação (autenticado)
- `updateSolicitacao(id, data)` - Atualizar solicitação (autenticado)
- `updateStatus(id, status)` - Atualizar status (autenticado)
- `deleteSolicitacao(id)` - Excluir solicitação (autenticado)

---

## Integração com a Navegação

### Opção 1: Adicionar ao HomeScreen do Jogador

Edite o arquivo `/app/src/screens/user_jogador/HomeScreen.js` e adicione botões para acessar as novas telas:

```javascript
import { useRouter } from 'expo-router';

const router = useRouter();

// Botão para ver arenas
<TouchableOpacity
    style={styles.menuButton}
    onPress={() => router.push('/src/screens/user_jogador/arenas/ArenasListScreen')}
>
    <Ionicons name="location" size={24} color={Colors.primary} />
    <Text style={styles.menuButtonText}>Arenas</Text>
</TouchableOpacity>

// Botão para ver rachas
<TouchableOpacity
    style={styles.menuButton}
    onPress={() => router.push('/src/screens/user_jogador/racha/SolicitacoesListScreen')}
>
    <Ionicons name="tennisball" size={24} color={Colors.primary} />
    <Text style={styles.menuButtonText}>Rachas</Text>
</TouchableOpacity>

// Botão para criar racha
<TouchableOpacity
    style={styles.createButton}
    onPress={() => router.push('/src/screens/user_jogador/racha/CreateSolicitacaoRachaScreen')}
>
    <Ionicons name="add-circle" size={24} color={Colors.white} />
    <Text style={styles.createButtonText}>Criar Racha</Text>
</TouchableOpacity>
```

### Opção 2: Criar Navegação por Tabs

Se você quiser usar tabs para navegação, crie um arquivo de layout:

```javascript
// app/src/screens/user_jogador/_layout.js
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';

export default function JogadorLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="arenas/ArenasListScreen"
                options={{
                    title: 'Arenas',
                    tabBarIcon: ({ color }) => <Ionicons name="location" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="racha/SolicitacoesListScreen"
                options={{
                    title: 'Rachas',
                    tabBarIcon: ({ color }) => <Ionicons name="tennisball" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
```

---

## Dependências Necessárias

Certifique-se de que as seguintes dependências estão instaladas:

```bash
# Instaladas via npm/yarn
npm install @react-native-picker/picker
npm install @react-native-community/datetimepicker
npm install @react-native-async-storage/async-storage
npm install @expo/vector-icons
npm install expo-router
```

---

## Configuração da API

As telas usam a configuração de API em `/app/src/config/api.config.ts`.

Certifique-se de que a URL base está correta:
- Android Emulator: `http://10.0.2.2:8000`
- iOS Simulator: `http://localhost:8000`
- Dispositivo Físico: IP da máquina na rede local

---

## Exemplo de Fluxo Completo

1. **Usuário abre o app e faz login**
2. **Navega para "Arenas"** → Vê todas as arenas disponíveis
3. **Busca por uma arena específica** → Usa a busca
4. **Clica em uma arena** → Vê detalhes (se tela de detalhes implementada)
5. **Navega para "Rachas"** → Vê solicitações abertas
6. **Clica em "Criar Racha"** → Preenche o formulário
7. **Seleciona arena, data, horário, etc.**
8. **Clica em "Criar Solicitação"** → Solicitação é criada
9. **Volta para listagem** → Vê a nova solicitação

---

## Melhorias Futuras Sugeridas

### Tela de Detalhes da Arena
- Mostrar fotos da arena
- Exibir horários de funcionamento
- Mostrar mapa de localização
- Listar quadras disponíveis
- Mostrar avaliações

### Tela de Detalhes da Solicitação
- Ver participantes confirmados
- Botão para participar/sair
- Chat entre participantes
- Histórico de status

### Funcionalidades Adicionais
- Filtros avançados (data, nível, preço)
- Notificações push
- Compartilhar solicitação
- Sistema de avaliação
- Geolocalização para arenas próximas

---

## Testes

### Testando as Telas:

1. **Inicie o servidor da API:**
```bash
cd /home/col/PhpstormProjects/ftv/api-fut
docker-compose up -d
```

2. **Inicie o app React Native:**
```bash
cd /home/col/PhpstormProjects/ftv/app-ftv
npm start
```

3. **Teste o fluxo:**
   - Faça login no app
   - Navegue para cada tela
   - Teste a busca de arenas
   - Crie uma solicitação de racha
   - Verifique a listagem de solicitações

---

## Troubleshooting

### Erro de conexão com API
- Verifique se o Docker está rodando
- Verifique se a URL base está correta no `api.config.ts`
- Verifique se o backend está respondendo em `http://localhost:8000/api/teste`

### Erro ao carregar arenas
- Verifique se há arenas cadastradas no banco de dados
- Teste a API diretamente: `curl http://localhost:8000/api/arenas`

### Erro ao criar solicitação
- Verifique se o usuário está autenticado (token válido)
- Verifique se a arena selecionada existe
- Verifique se os dados estão no formato correto

---

## Suporte

Para problemas ou dúvidas:
1. Verifique os logs do React Native: `npx react-native log-android` ou `npx react-native log-ios`
2. Verifique os logs da API: `docker-compose logs -f app`
3. Use o React Native Debugger para debug

# Correções de Cor e Tela de Edição de Perfil

## ✅ Tarefas Concluídas

### 1. Correção de Erros de Cor

Corrigidos todos os erros de cor nas telas criadas anteriormente. O problema era que `Colors.primary`, `Colors.warning`, `Colors.success` são objetos aninhados no tema, não strings de cor direta.

#### Arquivos Corrigidos:

**ArenasListScreen.js** (/app-ftv/app/src/screens/user_jogador/arenas/ArenasListScreen.js)
- ✅ `colors={[Colors.primary]}` → `colors={[Colors.primary.mikasaBright]}`
- ✅ `ActivityIndicator color={Colors.primary}` → `color={Colors.primary.mikasaBright}`
- ✅ `Colors.warning` → `Colors.status.warning`
- ✅ `Colors.success` → `Colors.status.success`
- ✅ Todas as cores de ícones atualizadas para usar propriedades aninhadas corretas

**SolicitacoesListScreen.js** (/app-ftv/app/src/screens/user_jogador/racha/SolicitacoesListScreen.js)
- ✅ `colors={[Colors.primary]}` → `colors={[Colors.primary.mikasaBright]}`
- ✅ `ActivityIndicator color` corrigido
- ✅ Cores das tabs atualizadas
- ✅ Ícones no renderSolicitacaoCard:
  - `<Ionicons color={Colors.primary} />` → `color={Colors.primary.mikasaBright}`
  - `<Ionicons color={Colors.warning} />` → `color={Colors.status.warning}`
  - `<Ionicons color={Colors.success} />` → `color={Colors.status.success}`

**CreateSolicitacaoRachaScreen.js**
- ✅ Verificado - nenhum erro de cor encontrado

---

### 2. Criação da Tela de Edição de Perfil

Criados novos arquivos para permitir que o jogador edite seu perfil existente.

#### Arquivos Criados:

**1. JogadorService** (/app-ftv/app/src/services/jogadorService.js)

Serviço completo para gerenciamento do perfil do jogador:

```javascript
export const JogadorService = {
    async getMe()           // GET /api/jogadores/me - Perfil do usuário logado
    async create()          // POST /api/jogadores - Criar novo perfil
    async update()          // PUT /api/jogadores/:id - Atualizar perfil
    async getRanking()      // GET /api/jogadores/ranking - Ranking
    async list()            // GET /api/jogadores - Listar jogadores
}
```

**Funcionalidades:**
- ✅ Autenticação com token
- ✅ Tratamento de erros de validação
- ✅ Parse de erros da API
- ✅ Retorno padronizado: `{ success, data, message, errors }`

**2. EditJogadorScreen** (/app-ftv/app/src/screens/user_jogador/jogador/EditJogadorScreen.js)

Tela completa para edição do perfil do jogador.

**Características:**
- ✅ Carrega dados existentes do jogador via API
- ✅ Loading state enquanto carrega dados
- ✅ Formulário completo com todos os campos:
  - CPF (com máscara)
  - Telefone (com máscara)
  - Data de Nascimento (com máscara DD/MM/YYYY)
  - Gênero (picker)
  - Cidade
  - Estado (UF, 2 caracteres)
  - Nível de Habilidade (picker)
  - Posição Preferida (picker)
  - Altura (cm)
  - Peso (kg)
  - Bio (textarea com contador de caracteres)

**Máscaras de Formatação:**
- ✅ CPF: `000.000.000-00`
- ✅ Telefone: `(00) 00000-0000`
- ✅ Data: `DD/MM/YYYY`
- ✅ Conversão de data do banco (YYYY-MM-DD) para exibição (DD/MM/YYYY)

**Validações:**
- ✅ CPF deve ter 11 dígitos
- ✅ Data de nascimento deve ter 8 dígitos
- ✅ Estado deve ter 2 caracteres
- ✅ Validação antes de enviar

**Estados:**
- ✅ `loading` - Carregando dados do servidor
- ✅ `saving` - Salvando alterações
- ✅ ActivityIndicator nos botões durante loading/saving
- ✅ Botão desabilitado durante salvamento

**Navegação:**
- ✅ Botão "Voltar" para retornar à tela anterior
- ✅ Após salvar com sucesso, volta para tela anterior
- ✅ Alertas de sucesso/erro

**3. Atualização do HomeScreen**

Modificado o HomeScreen para navegar para EditJogadorScreen ao invés de CreateJogadorScreen:

```javascript
// ANTES:
const navigateToProfile = () => {
    router.push('/src/screens/user_jogador/jogador/CreateJogadorScreen');
};

// DEPOIS:
const navigateToProfile = () => {
    router.push('/src/screens/user_jogador/jogador/EditJogadorScreen');
};
```

Agora o card "Perfil" no menu principal leva o usuário para editar seu perfil existente.

---

## 🎨 Estrutura de Cores Corrigida

### Antes (Incorreto):
```javascript
// ❌ ERRADO - Colors.primary é um objeto, não uma string
<ActivityIndicator color={Colors.primary} />
colors={[Colors.primary]}
<Ionicons color={Colors.warning} />
```

### Depois (Correto):
```javascript
// ✅ CORRETO - Usa propriedades aninhadas
<ActivityIndicator color={Colors.primary.mikasaBright} />
colors={[Colors.primary.mikasaBright]}
<Ionicons color={Colors.status.warning} />
```

### Mapa de Cores do Tema:

```javascript
Colors = {
    primary: {
        mikasa: '#FFD700',
        mikasaBright: '#FFEB3B',
        mikasaWarm: '#FFC107'
    },
    secondary: {
        ocean: '#0288D1',
        oceanDeep: '#01579B'
    },
    accent: {
        lime: '#8BC34A',
        coral: '#FF7043'
    },
    status: {
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3'
    },
    neutral: {
        white: '#FFFFFF',
        sandLight: '#F5F5F5',
        charcoal: '#757575',
        deepCharcoal: '#212121'
    }
}
```

---

## 🚀 Fluxo de Uso

### Editar Perfil do Jogador:

1. **HomeScreen** → Usuário clica no card "Perfil"
2. **EditJogadorScreen** → Carrega dados do perfil via API
3. **Formulário Preenchido** → Dados existentes aparecem formatados
4. **Usuário Edita** → Pode alterar qualquer campo
5. **Salvar Alterações** → Envia PUT para `/api/jogadores/:id`
6. **Sucesso** → Alert de sucesso e volta para tela anterior

### Máscaras em Ação:

```javascript
// Usuário digita: 12345678900
// Tela mostra:    123.456.789-00

// Usuário digita: 11987654321
// Tela mostra:    (11) 98765-4321

// Usuário digita: 15121990
// Tela mostra:    15/12/1990
```

---

## 📡 Chamadas de API

### GET /api/jogadores/me
```javascript
const result = await JogadorService.getMe();
// Returns: { success: true, data: { id, nome, cpf, ... } }
```

### PUT /api/jogadores/:id
```javascript
const result = await JogadorService.update(jogadorId, {
    telefone: '11987654321',
    data_nascimento: '15/12/1990',
    genero: 'masculino',
    cpf: '12345678900',
    cidade: 'São Paulo',
    estado: 'SP',
    nivel_habilidade: 'intermediario',
    posicao_preferida: 'ambos',
    bio: 'Jogador de vôlei...',
    altura: 180,
    peso: 75
});
// Returns: { success: true, data: {...}, message: 'Perfil atualizado com sucesso!' }
```

---

## 🧪 Como Testar

### 1. Testar Correções de Cor:

```bash
cd /home/col/PhpstormProjects/ftv/app-ftv
npm start
```

**Verificar:**
- ✅ ArenasListScreen não tem erros de cor
- ✅ SolicitacoesListScreen não tem erros de cor
- ✅ Loading indicators aparecem na cor correta (amarelo mikasa)
- ✅ Ícones aparecem nas cores corretas

### 2. Testar Tela de Edição de Perfil:

1. **Fazer login** como jogador
2. **HomeScreen** → Clicar no card "Perfil"
3. **Verificar carregamento:**
   - Loading indicator deve aparecer
   - Dados devem ser carregados e formatados
4. **Testar máscaras:**
   - Digitar CPF e ver formatação automática
   - Digitar telefone e ver formatação automática
   - Digitar data e ver formatação automática
5. **Editar campos:**
   - Alterar alguns campos
   - Clicar em "Salvar Alterações"
6. **Verificar salvamento:**
   - Loading no botão durante salvamento
   - Alert de sucesso
   - Volta para tela anterior

### 3. Testar Validações:

**CPF Inválido:**
```
Digite: 123
Resultado: Alert "CPF deve ter 11 dígitos"
```

**Data Inválida:**
```
Digite: 15/12/90 (faltam 2 dígitos do ano)
Resultado: Alert "Data de nascimento inválida"
```

**Estado Inválido:**
```
Digite: SAO (3 caracteres)
Resultado: Alert "Estado deve ter 2 caracteres"
```

---

## 📂 Estrutura de Arquivos

```
app-ftv/app/src/
├── services/
│   └── jogadorService.js                    ✅ NOVO
│
└── screens/user_jogador/
    ├── HomeScreen.js                         ✅ MODIFICADO
    │
    ├── arenas/
    │   └── ArenasListScreen.js              ✅ CORRIGIDO
    │
    ├── racha/
    │   ├── SolicitacoesListScreen.js        ✅ CORRIGIDO
    │   └── CreateSolicitacaoRachaScreen.js  ✅ VERIFICADO (OK)
    │
    └── jogador/
        ├── CreateJogadorScreen.js           (Existente)
        └── EditJogadorScreen.js             ✅ NOVO
```

---

## ✅ Resumo das Alterações

### Arquivos Novos (2):
1. `/app-ftv/app/src/services/jogadorService.js`
2. `/app-ftv/app/src/screens/user_jogador/jogador/EditJogadorScreen.js`

### Arquivos Modificados (3):
1. `/app-ftv/app/src/screens/user_jogador/arenas/ArenasListScreen.js` - Correções de cor
2. `/app-ftv/app/src/screens/user_jogador/racha/SolicitacoesListScreen.js` - Correções de cor
3. `/app-ftv/app/src/screens/user_jogador/HomeScreen.js` - Navegação atualizada

### Total de Erros Corrigidos:
- **ArenasListScreen**: ~10 referências de cor corrigidas
- **SolicitacoesListScreen**: ~8 referências de cor corrigidas

---

## 🎯 Funcionalidades Implementadas

✅ Serviço completo para gerenciamento de jogadores
✅ Tela de edição de perfil com carregamento de dados
✅ Máscaras de formatação para CPF, telefone e data
✅ Validações de formulário
✅ Loading states
✅ Tratamento de erros
✅ Navegação integrada ao HomeScreen
✅ Todas as correções de cor aplicadas

**Tudo pronto para uso!** 🚀

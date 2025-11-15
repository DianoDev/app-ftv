# Tela de Detalhes do Racha e Sistema de Convites

## ✅ Funcionalidades Implementadas

### 1. **Backend - API de Detalhes e Convites**

#### Endpoints Criados/Modificados:

**1. GET /api/solicitacoes-racha/{id}** - Detalhes completos da solicitação
- ✅ Carrega dados da solicitação
- ✅ Carrega arena com informações completas
- ✅ Carrega criador (nome, email)
- ✅ Carrega lista de participantes com dados dos usuários
- ✅ Retorna se usuário atual está participando
- ✅ Retorna se usuário atual é o criador

**Resposta:**
```json
{
  "success": true,
  "data": {
    "solicitacao": {
      "id": 1,
      "data_jogo": "2025-11-20",
      "hora_inicio": "14:00",
      "hora_fim": "16:00",
      "limite_participantes": 8,
      "status": "aberta",
      "arena": {
        "nome": "Arena Copacabana",
        "endereco": "Rua...",
        "cidade": "Rio de Janeiro",
        "estado": "RJ"
      },
      "criador": {
        "id": 5,
        "name": "João Silva"
      },
      "participantes": [
        {
          "id": 1,
          "status": "interessado",
          "usuario": {
            "id": 10,
            "name": "Maria Santos"
          }
        }
      ]
    },
    "is_participating": false,
    "is_criador": false
  }
}
```

**2. GET /api/solicitacoes-racha/{id}/jogadores-disponiveis** - Listar jogadores disponíveis
- ✅ Busca jogadores que NÃO estão participando
- ✅ Exclui o criador da lista
- ✅ Filtra por nome/email (parâmetro `search`)
- ✅ Retorna com paginação (20 por página)
- ✅ Inclui dados do jogador: nome, cidade, estado, nível

**3. POST /api/solicitacoes-racha/{id}/convidar** - Convidar jogador
- ✅ Requer autenticação
- ✅ Valida se usuário é criador OU participante
- ✅ Verifica se racha está aberto
- ✅ Verifica se jogador já não está participando
- ✅ Verifica limite de participantes
- ✅ Adiciona participante com status "convidado"

**Validações:**
```php
// Permissão para convidar
$isCriador = $solicitacao->criador_id === $user->id;
$isParticipante = DB::table('participantes_solicitacao')
    ->where('solicitacao_id', $id)
    ->where('usuario_id', $user->id)
    ->exists();

if (!$isCriador && !$isParticipante) {
    return response()->json(['success' => false, 'message' => 'Sem permissão'], 403);
}
```

---

### 2. **Frontend - Tela de Detalhes**

#### SolicitacaoDetailScreen.js

Tela completa com todos os detalhes do racha e funcionalidades interativas.

**Estrutura Visual:**

```
┌─────────────────────────────────────────────┐
│ ← Detalhes do Racha                        │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ┌─────┐                       [Aberta]  │ │
│ │ │  15 │ Quarta-feira                   │ │
│ │ │  11 │ 🕐 14:00 - 16:00               │ │
│ │ └─────┘                                 │ │
│ │                                         │ │
│ │ 📍 LOCAL                                │ │
│ │ Arena Copacabana                        │ │
│ │ Rua das Laranjeiras, 123                │ │
│ │ Rio de Janeiro, RJ                      │ │
│ │                                         │ │
│ │ 📄 DESCRIÇÃO                            │ │
│ │ Racha casual para jogadores...          │ │
│ │                                         │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐            │ │
│ │ │ 👥   │ │ 🏆   │ │ 💰   │            │ │
│ │ │ 5/8  │ │Inter.│ │R$25  │            │ │
│ │ └──────┘ └──────┘ └──────┘            │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Participantes (5)        [+ Convidar]  │ │
│ │ ─────────────────────────────────────── │ │
│ │ 👤 João Silva      ⭐ Criador           │ │
│ │ 👤 Maria Santos                         │ │
│ │ 👤 Pedro Oliveira   Convidado           │ │
│ │ 👤 Ana Costa                            │ │
│ │ 👤 Lucas Ferreira                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │      [✓  Entrar no Racha]              │ │
│ │           ou                            │ │
│ │      [⨯  Sair do Racha]                │ │
│ │           ou                            │ │
│ │   ⭐ Você é o criador deste racha       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Seções da Tela:**

1. **Card Principal** (fundo branco)
   - Data grande e visual
   - Dia da semana
   - Horário com ícone
   - Status badge
   - Informações da arena
   - Descrição
   - Grid de informações (participantes, nível, valor)

2. **Card de Participantes**
   - Lista de todos participantes
   - Criador destacado com estrela
   - Status de cada participante (convidado, etc.)
   - Botão "Convidar" (se criador ou participante)

3. **Seção de Ação**
   - Botão "Entrar" (verde) - se não está participando
   - Botão "Sair" (vermelho) - se está participando
   - Badge "Você é o criador" - se é o criador

---

### 3. **Modal de Convidar Jogadores**

Modal deslizante de baixo para cima com lista de jogadores disponíveis.

**Visual do Modal:**

```
┌─────────────────────────────────────────────┐
│ Convidar Jogador                          ⨯ │
├─────────────────────────────────────────────┤
│ ┌───────────────────────┐ [Buscar]         │
│ │ 🔍 Buscar por nome... │                   │
│ └───────────────────────┘                   │
│                                             │
│ 👤 Carlos Souza              [+]            │
│    São Paulo, SP                            │
│    Intermediário                            │
│ ─────────────────────────────────────────── │
│ 👤 Julia Lima                [+]            │
│    Rio de Janeiro, RJ                       │
│    Avançado                                 │
│ ─────────────────────────────────────────── │
│ 👤 Rafael Costa              [+]            │
│    Belo Horizonte, MG                       │
│    Iniciante                                │
│ ─────────────────────────────────────────── │
└─────────────────────────────────────────────┘
```

**Funcionalidades do Modal:**
- ✅ Busca por nome
- ✅ Lista paginada de jogadores
- ✅ Mostra cidade, estado e nível
- ✅ Botão "+" para convidar
- ✅ Fecha automaticamente após convidar
- ✅ Atualiza lista de participantes

---

### 4. **Navegação Implementada**

**De: SolicitacoesListScreen**
```javascript
const handleCardPress = (item) => {
    router.push({
        pathname: '/src/screens/user_jogador/racha/SolicitacaoDetailScreen',
        params: { solicitacaoId: item.id }
    });
};
```

**Para: SolicitacaoDetailScreen**
- Recebe `solicitacaoId` via params
- Carrega dados completos
- Mostra todos os detalhes
- Permite ações (entrar, sair, convidar)

---

## 🎨 Design e Estilos

### Paleta de Cores:

```javascript
// Card Principal
backgroundColor: Colors.neutral.white
borderRadius: BorderRadius.lg

// Data Box
backgroundColor: Colors.primary.mikasaBright + '15'  // Amarelo claro
dateDay: fontSize: 32, fontWeight: 'bold'

// Botão Convidar
backgroundColor: Colors.accent.lime  // Verde

// Botão Entrar
backgroundColor: Colors.accent.lime  // Verde

// Botão Sair
backgroundColor: Colors.status.error  // Vermelho

// Avatar Criador
backgroundColor: Colors.primary.mikasaBright + '15'

// Avatar Participante
backgroundColor: Colors.accent.lime + '15'
```

### Componentes Reutilizáveis:

**Section Header:**
```javascript
<View style={styles.sectionHeader}>
    <Ionicons name="location" size={20} color={Colors.primary.mikasaBright} />
    <Text style={styles.sectionTitle}>Local</Text>
</View>
```

**Info Card:**
```javascript
<View style={styles.infoCard}>
    <Ionicons name="people" size={24} color={Colors.primary.mikasaBright} />
    <Text style={styles.infoLabel}>Participantes</Text>
    <Text style={styles.infoValue}>5/8</Text>
</View>
```

**Participante Item:**
```javascript
<View style={styles.participanteItem}>
    <View style={styles.participanteAvatar}>
        <Ionicons name="person" size={24} />
    </View>
    <View style={styles.participanteInfo}>
        <Text style={styles.participanteNome}>Nome</Text>
        <Text style={styles.participanteStatus}>Status</Text>
    </View>
</View>
```

---

## 🔄 Fluxos de Uso

### Fluxo 1: Ver Detalhes do Racha

1. **Usuário** está na lista de rachas
2. **Toca** em um card de racha
3. **Navega** para SolicitacaoDetailScreen
4. **API carrega** dados completos:
   - Solicitação
   - Arena
   - Criador
   - Participantes
   - Status de participação
5. **Tela exibe** todos os detalhes
6. **Botões aparecem** baseados no estado do usuário

### Fluxo 2: Convidar Jogador

1. **Usuário** é criador ou participante
2. **Toca** no botão "Convidar"
3. **Modal abre** com lista de jogadores disponíveis
4. **Opcionalmente** busca por nome
5. **Toca** no "+" de um jogador
6. **API processa** convite:
   - Verifica permissões
   - Verifica vagas
   - Adiciona participante
7. **Modal fecha**
8. **Lista atualiza** com novo participante
9. **Alert confirma** sucesso

### Fluxo 3: Entrar no Racha (da tela de detalhes)

1. **Usuário** vê botão "Entrar"
2. **Toca** no botão
3. **Loading** aparece
4. **API processa** entrada
5. **Lista atualiza**
6. **Botão muda** para "Sair"
7. **Participante aparece** na lista

### Fluxo 4: Sair do Racha (da tela de detalhes)

1. **Usuário** vê botão "Sair"
2. **Toca** no botão
3. **Alert** pede confirmação
4. **Confirma** ação
5. **Loading** aparece
6. **API processa** saída
7. **Lista atualiza**
8. **Botão muda** para "Entrar"
9. **Participante removido** da lista

---

## 📊 Estados da Interface

| Condição | Botão Mostrado | Botão Convidar | Modal |
|----------|----------------|----------------|-------|
| É criador | Badge "Você é o criador" | ✅ Sim | ✅ Pode abrir |
| Está participando | "Sair" (vermelho) | ✅ Sim | ✅ Pode abrir |
| Não está participando + Tem vaga | "Entrar" (verde) | ❌ Não | ❌ Não pode abrir |
| Não está participando + Lotado | "Racha Lotado" (desabilitado) | ❌ Não | ❌ Não pode abrir |
| Racha não está aberto | Nenhum | ❌ Não | ❌ Não pode abrir |

---

## 🧪 Como Testar

### 1. Testar Navegação:

```bash
cd /home/col/PhpstormProjects/ftv/app-ftv
npm start
```

1. **Fazer login** como jogador
2. **Ir** para tela de Rachas
3. **Tocar** em qualquer card
4. **Verificar** navegação para detalhes
5. **Verificar** loading durante carregamento
6. **Verificar** dados exibidos corretamente

### 2. Testar Convidar:

**Pré-requisito:** Ser criador ou participante de um racha

1. **Abrir** detalhes de um racha seu
2. **Tocar** em "Convidar"
3. **Modal abre**
4. **Ver** lista de jogadores disponíveis
5. **Buscar** por nome (opcional)
6. **Tocar** no "+" de um jogador
7. **Verificar** alert de sucesso
8. **Verificar** modal fecha
9. **Verificar** jogador aparece na lista

### 3. Testar Entrar/Sair:

1. **Abrir** detalhes de um racha de outro usuário
2. **Verificar** botão "Entrar" verde
3. **Tocar** em "Entrar"
4. **Verificar** loading
5. **Verificar** botão muda para "Sair"
6. **Verificar** aparece na lista de participantes
7. **Tocar** em "Sair"
8. **Confirmar** no alert
9. **Verificar** botão volta para "Entrar"
10. **Verificar** removido da lista

### 4. Testar Criador:

1. **Criar** um novo racha
2. **Abrir** detalhes desse racha
3. **Verificar** badge "Você é o criador"
4. **Verificar** botão "Convidar" disponível
5. **Convidar** um jogador
6. **Verificar** jogador adicionado

---

## 📝 Validações Implementadas

### Backend:

**Endpoint show():**
1. ✅ Solicitação existe
2. ✅ Carrega relacionamentos necessários
3. ✅ Calcula se usuário está participando
4. ✅ Identifica se usuário é criador

**Endpoint jogadoresDisponiveis():**
1. ✅ Usuário autenticado
2. ✅ Solicitação existe
3. ✅ Exclui participantes atuais
4. ✅ Exclui criador
5. ✅ Filtra por busca (opcional)

**Endpoint convidar():**
1. ✅ Usuário autenticado
2. ✅ usuario_id fornecido e válido
3. ✅ Usuário é criador OU participante
4. ✅ Racha está aberto
5. ✅ Jogador não está participando
6. ✅ Há vagas disponíveis

### Frontend:

1. ✅ Navegação com parâmetro correto
2. ✅ Loading durante carregamento
3. ✅ Tratamento de erros
4. ✅ Botões corretos baseados no estado
5. ✅ Modal de convite funcional
6. ✅ Busca de jogadores
7. ✅ Atualização automática após ações
8. ✅ Confirmação antes de sair

---

## 🎯 Benefícios

1. ✅ **Visão Completa** - Todos detalhes em uma tela
2. ✅ **Lista de Participantes** - Vê quem já confirmou
3. ✅ **Sistema de Convites** - Criador e participantes podem convidar
4. ✅ **Busca de Jogadores** - Encontra facilmente quem convidar
5. ✅ **UX Intuitiva** - Ações claras e feedback imediato
6. ✅ **Design Moderno** - Visual atrativo e profissional
7. ✅ **Navegação Fluida** - Transições suaves
8. ✅ **Permissões Corretas** - Apenas quem pode, convida

---

## 🔮 Possíveis Melhorias Futuras

1. **Notificações de Convite:**
   - Enviar notificação push para jogador convidado
   - Sistema de aceitar/recusar convite
   - Badge de "Novo convite"

2. **Informações dos Participantes:**
   - Ver perfil ao tocar no participante
   - Histórico de jogos juntos
   - Estatísticas do jogador

3. **Chat do Racha:**
   - Mensagens entre participantes
   - Coordenação de detalhes
   - Compartilhamento de localização

4. **Compartilhamento:**
   - Compartilhar racha por WhatsApp
   - Gerar link de convite
   - QR Code para entry

5. **Fotos da Arena:**
   - Galeria de fotos
   - Visualização em tela cheia
   - Upload de fotos pelos participantes

---

## ✅ Resumo

**Backend:**
- ✅ Endpoint de detalhes completo com relacionamentos
- ✅ Endpoint para listar jogadores disponíveis
- ✅ Endpoint para convidar jogadores
- ✅ Validações robustas
- ✅ Permissões corretas

**Frontend:**
- ✅ Tela de detalhes completa e moderna
- ✅ Lista de participantes com destaque para criador
- ✅ Modal de convites com busca
- ✅ Botões dinâmicos baseados no estado
- ✅ Navegação integrada
- ✅ UX fluida e intuitiva

**Tudo funcionando perfeitamente!** 🚀

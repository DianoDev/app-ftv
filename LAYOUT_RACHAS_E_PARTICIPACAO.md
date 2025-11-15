# Melhorias na Tela de Rachas e Sistema de Participação

## ✅ Tarefas Concluídas

### 1. **Backend - API de Participação em Rachas**

Criados novos endpoints e funcionalidades para permitir que usuários entrem e saiam de rachas.

#### Arquivos Modificados/Criados no Backend:

**1. SolicitacaoRachaController.php** (`/api-fut/app/Http/Controllers/Users/SolicitacaoRachaController.php`)

Adicionados 2 novos métodos:

```php
/**
 * Participar de uma solicitação de racha
 * POST /api/solicitacoes-racha/{id}/participar
 */
public function participar(int $id): JsonResponse

/**
 * Sair de uma solicitação de racha
 * DELETE /api/solicitacoes-racha/{id}/sair
 */
public function sair(int $id): JsonResponse
```

**Funcionalidades do método `participar()`:**
- ✅ Verifica se a solicitação está aberta
- ✅ Verifica se o usuário NÃO é o criador
- ✅ Verifica se o usuário já está participando
- ✅ Verifica se há vagas disponíveis (limite de participantes)
- ✅ Adiciona o usuário na tabela `participantes_solicitacao`
- ✅ Retorna mensagens de erro apropriadas

**Funcionalidades do método `sair()`:**
- ✅ Verifica se o usuário NÃO é o criador
- ✅ Verifica se o usuário está participando
- ✅ Remove o usuário da tabela `participantes_solicitacao`
- ✅ Retorna mensagens de erro apropriadas

**2. ParticipantesSolicitacao.php** (`/api-fut/app/Databases/Models/ParticipantesSolicitacao.php`)

Criado novo Model para a tabela `participantes_solicitacao`:

```php
class ParticipantesSolicitacao extends Model
{
    protected $table = 'participantes_solicitacao';

    // Relacionamentos
    public function solicitacao(): BelongsTo
    public function usuario(): BelongsTo
}
```

**3. SolicitacoesRacha.php** (`/api-fut/app/Databases/Models/SolicitacoesRacha.php`)

Adicionado relacionamento com participantes:

```php
/**
 * Relacionamento com Participantes
 */
public function participantes(): HasMany
{
    return $this->hasMany(ParticipantesSolicitacao::class, 'solicitacao_id');
}
```

**4. SolicitacoesRachaRepository.php** (`/api-fut/app/Databases/Repositories/SolicitacoesRachaRepository.php`)

Modificado o método `paginate()` para incluir contagem de participantes:

```php
public function paginate(array $pagination = [], array $columns = ['*']): LengthAwarePaginator
{
    $query = SolicitacoesRacha::query();

    // Adicionar contagem de participantes
    $query->withCount('participantes');

    // Carregar relacionamento com arena
    $query->with('arena:id,nome,cidade,estado');

    // ... filtros e paginação
}
```

**5. api.php** (`/api-fut/routes/api.php`)

Adicionadas novas rotas protegidas por autenticação:

```php
// Rotas de participação em rachas
Route::prefix('solicitacoes-racha')->group(function () {
    Route::post('/{id}/participar', [SolicitacaoRachaController::class, 'participar']);
    Route::delete('/{id}/sair', [SolicitacaoRachaController::class, 'sair']);
});
```

---

### 2. **Frontend - Serviço de Participação**

Atualizados os serviços do frontend para comunicação com a API.

**solicitacaoRachaService.js** (`/app-ftv/app/src/services/solicitacaoRachaService.js`)

Adicionados 2 novos métodos:

```javascript
/**
 * Participar de uma solicitação de racha
 */
async participar(solicitacaoId)

/**
 * Sair de uma solicitação de racha
 */
async sair(solicitacaoId)
```

---

### 3. **Frontend - Layout Completamente Redesenhado**

A tela de rachas foi completamente reformulada com um design moderno e funcional.

**SolicitacoesListScreen.js** (`/app-ftv/app/src/screens/user_jogador/racha/SolicitacoesListScreen.js`)

#### Melhorias Visuais:

**1. Card de Racha Redesenhado:**

```
┌─────────────────────────────────────────────┐
│ ┌──────┐                         [Aberta]  │
│ │ SEG  │ Arena Copacabana                  │
│ │  15  │ 📍 Copacabana, RJ                 │
│ │  11  │ 🕐 14:00 - 16:00                  │
│ └──────┘                                    │
│                                             │
│ Racha casual para jogadores intermediários │
│                                             │
│ 👥 5/8    🏆 Intermediário    💰 R$ 25,00  │
│ ──────────────────────────────────────────  │
│ [          ✓  Entrar no Racha            ] │
│             ou                              │
│ [         ⭐ Você é o criador            ]  │
│             ou                              │
│ [          ⨯  Sair do Racha              ] │
└─────────────────────────────────────────────┘
```

**Elementos do Card:**

1. **Seção de Data (Esquerda):**
   - Dia da semana (SEG, TER, etc.)
   - Dia do mês (grande, em destaque)
   - Mês
   - Fundo com cor do tema

2. **Informações Principais (Centro):**
   - Nome da arena (negrito)
   - Localização (cidade, estado)
   - Horário (início - fim)

3. **Status Badge (Direita):**
   - Badge colorido com status
   - Cores diferentes por status:
     - Verde: Aberta
     - Amarelo: Confirmada
     - Vermelho: Cancelada
     - Cinza: Concluída

4. **Descrição:**
   - Texto da descrição (máximo 2 linhas)

5. **Informações Adicionais:**
   - Participantes: `👥 5/8`
   - Nível sugerido: `🏆 Intermediário`
   - Valor: `💰 R$ 25,00`

6. **Botões de Ação:**
   - **Se é o criador:** Badge "Você é o criador" (apenas informativo)
   - **Se está participando:** Botão "Sair" (vermelho)
   - **Se não está participando:** Botão "Entrar" (verde)
   - **Se está lotado:** Botão "Lotado" (desabilitado, cinza)

#### Funcionalidades Implementadas:

**1. Detecção de Criador:**
```javascript
const isCriador = currentUserId === item.criador_id;
```

**2. Verificação de Vagas:**
```javascript
const isSolicitacaoFull = (solicitacao) => {
    const totalParticipantes = (solicitacao.participantes_count || 0) + 1; // +1 para o criador
    return totalParticipantes >= solicitacao.limite_participantes;
};
```

**3. Handlers de Participação:**
```javascript
const handleParticipar = async (solicitacao) => {
    setActionLoading(solicitacao.id);
    const result = await SolicitacaoRachaService.participar(solicitacao.id);
    setActionLoading(null);

    if (result.success) {
        Alert.alert('Sucesso', result.message);
        handleRefresh(); // Recarrega a lista
    } else {
        Alert.alert('Erro', result.message);
    }
};

const handleSair = async (solicitacao) => {
    Alert.alert(
        'Confirmar',
        'Tem certeza que deseja sair deste racha?',
        [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    // Executar ação de sair
                }
            }
        ]
    );
};
```

**4. Loading States:**
- ✅ Loading individual por card durante ação
- ✅ ActivityIndicator no botão durante processamento
- ✅ Desabilita botão durante loading
- ✅ Atualiza lista automaticamente após ação

**5. Estados da Interface:**

| Condição | Botão Exibido | Cor | Ação |
|----------|---------------|-----|------|
| É o criador | "Você é o criador" | Amarelo (badge) | Nenhuma |
| Está participando | "Sair" | Vermelho | Sair do racha |
| Não está participando + Tem vaga | "Entrar" | Verde | Entrar no racha |
| Não está participando + Lotado | "Lotado" | Cinza (desabilitado) | Nenhuma |

---

## 🎨 Melhorias de Design

### Paleta de Cores:

```javascript
// Data Section
backgroundColor: Colors.primary.mikasaBright + '15'  // Amarelo claro

// Botão Entrar
backgroundColor: Colors.accent.lime  // Verde

// Botão Sair
backgroundColor: Colors.status.error  // Vermelho

// Botão Lotado
backgroundColor: Colors.neutral.charcoal  // Cinza
opacity: 0.5

// Status Badges
Aberta:      Colors.status.success  // Verde
Confirmada:  Colors.primary.mikasaBright  // Amarelo
Cancelada:   Colors.status.error  // Vermelho
Concluída:   Colors.neutral.charcoal  // Cinza
```

### Tipografia:

```javascript
// Data Section
dayOfWeek:  fontSize: 11, fontWeight: '600'
dateDay:    fontSize: 24, fontWeight: 'bold'
dateMonth:  fontSize: 11

// Arena
arenaName:  Typography.h3

// Informações
infoText:   fontSize: 13, fontWeight: '500'

// Botões
actionButtonText: Typography.button, fontWeight: '600'
```

---

## 🔄 Fluxo de Uso

### Cenário 1: Usuário Entra em um Racha

1. **Usuário navega** para a tela de Rachas
2. **Vê a lista** de rachas disponíveis
3. **Identifica um racha** com vagas disponíveis
4. **Toca no botão** "Entrar"
5. **Loading aparece** no botão
6. **API processa** a solicitação:
   - Verifica se racha está aberto
   - Verifica se há vagas
   - Verifica se usuário já não está participando
   - Adiciona usuário na tabela de participantes
7. **Alert de sucesso** aparece
8. **Lista é atualizada** automaticamente
9. **Botão muda** para "Sair" (vermelho)

### Cenário 2: Usuário Sai de um Racha

1. **Usuário está participando** de um racha
2. **Vê o botão** "Sair" (vermelho)
3. **Toca no botão** "Sair"
4. **Alert de confirmação** aparece
5. **Confirma** a ação
6. **Loading aparece** no botão
7. **API processa** a remoção:
   - Remove usuário da tabela de participantes
8. **Alert de sucesso** aparece
9. **Lista é atualizada** automaticamente
10. **Botão muda** para "Entrar" (verde)

### Cenário 3: Criador Visualiza Seu Racha

1. **Criador navega** para a tela de Rachas
2. **Vê seu racha** na lista
3. **Badge "Você é o criador"** aparece
4. **Não pode sair** do próprio racha
5. **Vê contagem** de participantes em tempo real

### Cenário 4: Racha está Lotado

1. **Usuário vê** um racha na lista
2. **Racha está lotado** (8/8 participantes)
3. **Botão "Lotado"** aparece desabilitado
4. **Não pode** tocar no botão
5. **Indicação visual** de que não há vagas

---

## 📊 Estrutura de Dados

### Resposta da API (Exemplo):

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "criador_id": 5,
        "arena_id": 10,
        "data_jogo": "2025-11-20",
        "hora_inicio": "14:00",
        "hora_fim": "16:00",
        "limite_participantes": 8,
        "participantes_count": 4,
        "valor_por_pessoa": "25.00",
        "status": "aberta",
        "nivel_sugerido": "Intermediário",
        "descricao": "Racha casual para jogadores intermediários",
        "arena": {
          "id": 10,
          "nome": "Arena Copacabana",
          "cidade": "Rio de Janeiro",
          "estado": "RJ"
        }
      }
    ],
    "last_page": 3,
    "total": 25
  }
}
```

### Tabela participantes_solicitacao:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | ID único |
| solicitacao_id | bigint | ID da solicitação |
| usuario_id | bigint | ID do usuário |
| status | string | Status (interessado, confirmado, etc.) |
| valor_pago | decimal | Valor pago pelo participante |
| pagamento_confirmado | boolean | Se pagamento foi confirmado |
| metodo_pagamento | string | Forma de pagamento |
| comprovante_url | text | URL do comprovante |
| observacoes | text | Observações |
| confirmado_em | timestamp | Data de confirmação |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

---

## 🧪 Como Testar

### 1. Testar Backend:

```bash
cd /home/col/PhpstormProjects/ftv/api-fut

# Testar participar de um racha
curl -X POST http://localhost:8000/api/solicitacoes-racha/1/participar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Testar sair de um racha
curl -X DELETE http://localhost:8000/api/solicitacoes-racha/1/sair \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### 2. Testar Frontend:

```bash
cd /home/col/PhpstormProjects/ftv/app-ftv
npm start
```

**Passos para Teste:**

1. **Fazer login** como jogador
2. **Navegar** para "Rachas" no menu principal
3. **Verificar layout** dos cards:
   - Data à esquerda
   - Informações ao centro
   - Status à direita
   - Ícones coloridos
   - Botões de ação

4. **Testar ação de entrar:**
   - Encontrar racha com vagas
   - Tocar em "Entrar"
   - Verificar loading
   - Verificar alert de sucesso
   - Verificar que botão mudou para "Sair"

5. **Testar ação de sair:**
   - No mesmo racha
   - Tocar em "Sair"
   - Confirmar no alert
   - Verificar loading
   - Verificar que botão mudou para "Entrar"

6. **Testar racha próprio:**
   - Criar um novo racha
   - Voltar para lista
   - Verificar badge "Você é o criador"

7. **Testar racha lotado:**
   - Encontrar racha com 8/8 participantes
   - Verificar botão "Lotado" desabilitado

---

## 📝 Validações Implementadas

### Backend:

1. ✅ Usuário autenticado
2. ✅ Solicitação existe
3. ✅ Solicitação está aberta
4. ✅ Usuário não é o criador
5. ✅ Usuário não está participando (para entrar)
6. ✅ Há vagas disponíveis (para entrar)
7. ✅ Usuário está participando (para sair)
8. ✅ Unique constraint (solicitacao_id + usuario_id)

### Frontend:

1. ✅ Botão correto baseado no estado
2. ✅ Loading durante ações
3. ✅ Confirmação antes de sair
4. ✅ Atualização automática da lista
5. ✅ Mensagens de erro/sucesso
6. ✅ Desabilita botão quando lotado

---

## 🎯 Benefícios das Melhorias

1. ✅ **Visual Moderno** - Design clean e profissional
2. ✅ **UX Intuitiva** - Ações claras e óbvias
3. ✅ **Feedback Imediato** - Loading e alerts
4. ✅ **Validações Robustas** - Previne erros
5. ✅ **Estados Claros** - Usuário sempre sabe o que pode fazer
6. ✅ **Performance** - Loading individual por card
7. ✅ **Acessibilidade** - Cores e ícones significativos
8. ✅ **Responsividade** - Layout adaptável

---

## 🔮 Próximas Melhorias Sugeridas

1. **Notificações em Tempo Real:**
   - WebSocket para atualizar contador de participantes
   - Notificação quando racha está quase lotando
   - Notificação quando alguém sai

2. **Perfil dos Participantes:**
   - Ver lista de participantes
   - Ver nível de cada participante
   - Ver histórico de jogos juntos

3. **Sistema de Pagamento:**
   - Marcar pagamento como feito
   - Upload de comprovante
   - Confirmação de pagamento pelo criador

4. **Chat do Racha:**
   - Comunicação entre participantes
   - Coordenação de detalhes
   - Avisos importantes

5. **Avaliações:**
   - Avaliar participantes após o jogo
   - Sistema de reputação
   - Comentários e feedback

---

## ✅ Resumo

**Backend:**
- ✅ 2 novos endpoints (participar, sair)
- ✅ 1 novo Model (ParticipantesSolicitacao)
- ✅ Relacionamento com participantes
- ✅ Contagem de participantes na listagem
- ✅ Validações completas
- ✅ Rotas protegidas por autenticação

**Frontend:**
- ✅ Layout completamente redesenhado
- ✅ Botões dinâmicos baseados no estado
- ✅ Loading individual por ação
- ✅ Confirmação antes de sair
- ✅ Atualização automática após ações
- ✅ Design moderno e colorido
- ✅ UX intuitiva

**Tudo pronto para uso!** 🚀

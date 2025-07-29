# Correção: Modal de Dispositivo Sobreposto ao Modal de Firmware

## Problema Identificado
Quando o usuário clicava em um card de firmware no dashboard e em seguida clicava em um IMEI dentro do modal de firmware, o modal de detalhes do dispositivo aparecia por baixo do modal de firmware.

## Causa Raiz
- Modal de firmware: `z-index: 2000`
- Modal de detalhes do dispositivo: `z-index: 1000`

Como o modal de firmware tinha maior z-index, ele ficava por cima do modal de detalhes.

## Solução Implementada

### 1. Detecção de Contexto
Modificada a função `showDeviceDetails()` para detectar se há um modal de firmware aberto:

```javascript
const firmwareModal = document.getElementById('firmwareModal');
if (firmwareModal && firmwareModal.classList.contains('show')) {
    // Modal firmware está aberto - usar z-index maior
    deviceModal.style.zIndex = '2100';
    deviceModal.classList.add('overlay-modal');
} else {
    // Modo normal - usar z-index padrão
    deviceModal.style.zIndex = '1000';
    deviceModal.classList.remove('overlay-modal');
}
```

### 2. Classe CSS Especial
Adicionada classe `.overlay-modal` para estilizar modais sobrepostos:

```css
.modal.overlay-modal {
    z-index: 2100 !important;
    background: rgba(0, 0, 0, 0.8);
}

.modal.overlay-modal .modal-content {
    border: 2px solid var(--primary-color);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
```

### 3. Reset ao Fechar
Modificada a função `hideModal()` para resetar o estado:

```javascript
function hideModal() {
    deviceModal.classList.add('hidden');
    deviceModal.style.zIndex = '1000';
    deviceModal.classList.remove('overlay-modal');
}
```

### 4. Correção de Bug
Corrigido erro na função ESC onde `closeModal()` era chamado mas não existia:

```javascript
// Antes (erro):
closeModal();

// Depois (correto):
hideModal();
```

## Hierarquia de Z-Index Final

1. **Modal de Firmware**: `z-index: 2000`
2. **Modal de Dispositivo Sobreposto**: `z-index: 2100`
3. **Modal de Dispositivo Normal**: `z-index: 1000`

## Comportamento Esperado

### Cenário 1: Modal de Dispositivo Normal
- Usuário clica em IMEI na lista principal
- Modal abre com `z-index: 1000`
- Aparece normalmente

### Cenário 2: Modal de Dispositivo Sobreposto
- Usuário clica em firmware no dashboard
- Modal de firmware abre (`z-index: 2000`)
- Usuário clica em IMEI dentro do modal de firmware
- Modal de dispositivo abre com `z-index: 2100`
- Aparece **por cima** do modal de firmware
- Tem background mais escuro e borda destacada

### Cenário 3: Fechamento
- Usuário fecha modal de dispositivo
- Z-index é resetado para `1000`
- Classe `overlay-modal` é removida
- Modal de firmware continua visível

## Arquivos Modificados

1. **`js/app.js`**
   - Função `showDeviceDetails()`: Detecção de contexto e ajuste de z-index
   - Função `hideModal()`: Reset de estado
   - Event listener ESC: Correção de bug

2. **`css/styles.css`**
   - Classe `.overlay-modal`: Estilização para modais sobrepostos

3. **`js/test-modal-zindex.js`**
   - Teste automatizado para validar correção

## Teste
Para testar a correção:
1. Abrir dashboard
2. Clicar em card de firmware
3. Clicar em qualquer IMEI no modal de firmware
4. Verificar se modal de dispositivo aparece **por cima** do modal de firmware
5. Fechar modal de dispositivo
6. Verificar se modal de firmware ainda está visível

## Resultado
✅ **Problema resolvido**: Modal de dispositivo agora aparece corretamente por cima do modal de firmware quando necessário.

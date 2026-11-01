# Rastreamento com chegada — Design curto

## Objetivo
Separar entregador a caminho de entregador chegado, permitindo que cliente veja código numérico somente quando a entrega chegar.

## Fluxo
- `novo`: Pedido confirmado! / Aguardando confirmação da loja.
- `preparando`: Em preparo / Seu pedido está sendo preparado.
- `pronto`: Pronto / Aguardando retirada ou entregador.
- `saiu`: A caminho / Entregador saiu com seu pedido.
- `chegou`: Seu pedido chegou! / Código de entrega: `order.code`.
- `concluido`: Entregue / Bom apetite!

## Visual
- Estado atual: amarelo com animação no número.
- Estados concluídos: verde.
- Estados futuros: cinza.
- Botão atualizar sincroniza pedido recebido após `router.refresh()`.

## Alterações
- Adicionar `chegou` a `OrderStatus`, labels e fluxo.
- Entregador muda `saiu` para `chegou`, depois `concluido`.
- Gestão de entregas exibe ações correspondentes.
- Rastreamento usa estado local sincronizado com prop nova.
- SQLite já armazena status como JSON; nenhum schema novo é necessário.
